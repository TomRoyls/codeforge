import { describe, test, expect, vi } from 'vitest'
import { noSameSideConditionsRule } from '../../../../src/rules/patterns/no-same-side-conditions.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'BooleanLiteral',
    value,
  }
}

function createNumericLiteral(value: number): unknown {
  return {
    type: 'NumericLiteral',
    value,
  }
}

function createStringLiteral(value: string): unknown {
  return {
    type: 'StringLiteral',
    value,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
  }
}

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
  }
}

function createLogicalExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-same-side-conditions rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSameSideConditionsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noSameSideConditionsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noSameSideConditionsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSameSideConditionsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noSameSideConditionsRule.meta.schema).toBeDefined()
      expect(noSameSideConditionsRule.meta.schema).toEqual([])
    })

    test('should be fixable', () => {
      expect(noSameSideConditionsRule.meta.fixable).toBe('code')
    })

    test('should mention same side conditions in description', () => {
      expect(noSameSideConditionsRule.meta.docs?.description.toLowerCase()).toContain('both sides')
    })

    test('should mention redundant in description', () => {
      expect(noSameSideConditionsRule.meta.docs?.description.toLowerCase()).toContain('redundant')
    })

    test('should have docs property defined', () => {
      expect(noSameSideConditionsRule.meta.docs).toBeDefined()
    })

    test('should have docs description as string', () => {
      expect(typeof noSameSideConditionsRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noSameSideConditionsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have url in docs', () => {
      expect(noSameSideConditionsRule.meta.docs?.url).toBeDefined()
    })

    test('should have url containing rule name', () => {
      expect(noSameSideConditionsRule.meta.docs?.url).toContain('no-same-side-conditions')
    })

    test('should have docs url as string', () => {
      expect(typeof noSameSideConditionsRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as empty array', () => {
      expect(noSameSideConditionsRule.meta.schema).toEqual([])
      expect(noSameSideConditionsRule.meta.schema.length).toBe(0)
    })

    test('should have type as string', () => {
      expect(typeof noSameSideConditionsRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noSameSideConditionsRule.meta.severity).toBe('string')
    })

    test('should have fixable as code', () => {
      expect(noSameSideConditionsRule.meta.fixable).toBe('code')
      expect(typeof noSameSideConditionsRule.meta.fixable).toBe('string')
    })

    test('should have recommended as boolean true', () => {
      expect(noSameSideConditionsRule.meta.docs?.recommended).toBe(true)
      expect(typeof noSameSideConditionsRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as patterns string', () => {
      expect(typeof noSameSideConditionsRule.meta.docs?.category).toBe('string')
    })
  })

  describe('create', () => {
    test('should return visitor object with LogicalExpression method', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
      expect(typeof visitor.LogicalExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should return visitor as object', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor1 = noSameSideConditionsRule.create(context)
      const visitor2 = noSameSideConditionsRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have exactly one property on visitor', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(Object.keys(visitor)).toEqual(['LogicalExpression'])
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockRuleContext({ source: 'a && a', filePath: '/project/src/utils.ts' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
    })

    test('should accept context with different source code', () => {
      const { context } = createMockRuleContext({ source: 'x || x && y', filePath: '/src/file.ts' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
    })

    test('should create visitor that is callable', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(() =>
        visitor.LogicalExpression(
          createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a')),
        ),
      ).not.toThrow()
    })
  })

  describe('AND operator (&&) - same side detection', () => {
    test('should report a && a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
      expect(reports[0].message).toContain('identical')
      expect(reports[0].message).toContain('redundant')
    })

    test('should report foo && foo', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('foo'), createIdentifier('foo'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report true && true', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(true),
        createBooleanLiteral(true),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report false && false', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(false),
        createBooleanLiteral(false),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report 1 && 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createNumericLiteral(1), createNumericLiteral(1))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report "test" && "test"', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createStringLiteral('test'),
        createStringLiteral('test'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report same numeric values with &&', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createNumericLiteral(42), createNumericLiteral(42))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same string values with &&', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createStringLiteral('abc'),
        createStringLiteral('abc'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same identifier with underscore names', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createIdentifier('_private'),
        createIdentifier('_private'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same identifier with dollar sign names', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createIdentifier('$jquery'),
        createIdentifier('$jquery'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 && 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createNumericLiteral(0), createNumericLiteral(0))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report negative numbers -1 && -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createNumericLiteral(-1), createNumericLiteral(-1))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty string && empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createStringLiteral(''), createStringLiteral(''))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Literal true && Literal true', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral(true), createLiteral(true))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Literal false && Literal false', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral(false), createLiteral(false))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same large number with &&', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createNumericLiteral(999999),
        createNumericLiteral(999999),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same decimal with &&', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createNumericLiteral(3.14),
        createNumericLiteral(3.14),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('OR operator (||) - same side detection', () => {
    test('should report a || a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
      expect(reports[0].message).toContain('identical')
      expect(reports[0].message).toContain('redundant')
    })

    test('should report x || x', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('x'), createIdentifier('x'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report true || true', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createBooleanLiteral(true),
        createBooleanLiteral(true),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report false || false', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createBooleanLiteral(false),
        createBooleanLiteral(false),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report 0 || 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createNumericLiteral(0), createNumericLiteral(0))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report same string values with ||', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createStringLiteral('hello'),
        createStringLiteral('hello'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same negative numbers with ||', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createNumericLiteral(-5), createNumericLiteral(-5))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same identifier with camelCase', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createIdentifier('myVar'),
        createIdentifier('myVar'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Literal number || Literal number', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createLiteral(42), createLiteral(42))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same long string with ||', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const longStr = 'a very long string value for testing'
      const node = createLogicalExpression(
        '||',
        createStringLiteral(longStr),
        createStringLiteral(longStr),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('member expressions - same side detection', () => {
    test('should report obj.prop && obj.prop', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report data.value || data.value', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('data'), createIdentifier('value'))
      const right = createMemberExpression(createIdentifier('data'), createIdentifier('value'))
      const node = createLogicalExpression('||', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report nested member expressions obj.inner.prop && obj.inner.prop', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const inner = createMemberExpression(createIdentifier('obj'), createIdentifier('inner'))
      const left = createMemberExpression(inner, createIdentifier('prop'))
      const inner2 = createMemberExpression(createIdentifier('obj'), createIdentifier('inner'))
      const right = createMemberExpression(inner2, createIdentifier('prop'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report this.value && this.value', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('this'), createIdentifier('value'))
      const right = createMemberExpression(createIdentifier('this'), createIdentifier('value'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report config.settings.enabled || config.settings.enabled', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const settings = createMemberExpression(
        createIdentifier('config'),
        createIdentifier('settings'),
      )
      const left = createMemberExpression(settings, createIdentifier('enabled'))
      const settings2 = createMemberExpression(
        createIdentifier('config'),
        createIdentifier('settings'),
      )
      const right = createMemberExpression(settings2, createIdentifier('enabled'))
      const node = createLogicalExpression('||', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('call expressions - same side detection', () => {
    test('should report func() && func()', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('func'))
      const right = createCallExpression(createIdentifier('func'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report getData() || getData()', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('getData'))
      const right = createCallExpression(createIdentifier('getData'))
      const node = createLogicalExpression('||', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report same method call obj.method() && obj.method()', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const calleeLeft = createMemberExpression(createIdentifier('obj'), createIdentifier('method'))
      const calleeRight = createMemberExpression(
        createIdentifier('obj'),
        createIdentifier('method'),
      )
      const left = createCallExpression(calleeLeft)
      const right = createCallExpression(calleeRight)
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report isReady() && isReady()', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('isReady'))
      const right = createCallExpression(createIdentifier('isReady'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report check() || check()', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('check'))
      const right = createCallExpression(createIdentifier('check'))
      const node = createLogicalExpression('||', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('valid cases - different sides (NOT reporting)', () => {
    test('should not report a && b', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x || y', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('x'), createIdentifier('y'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report true && false', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 1 && 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createNumericLiteral(1), createNumericLiteral(0))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "a" && "b"', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createStringLiteral('a'), createStringLiteral('b'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.prop && obj.other', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('other'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report func1() && func2()', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('func1'))
      const right = createCallExpression(createIdentifier('func2'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report true || false', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report false && true', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report different numeric values 1 || 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createNumericLiteral(1), createNumericLiteral(2))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report identifier && member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const right = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const node = createLogicalExpression('&&', createIdentifier('a'), right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report member expression && call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('fn'))
      const right = createCallExpression(createIdentifier('fn'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" && "world"', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createStringLiteral('hello'),
        createStringLiteral('world'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 42 || 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createNumericLiteral(42), createNumericLiteral(0))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Literal different string values', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral('a'), createLiteral('b'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Literal different number values', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral(1), createLiteral(2))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Literal different boolean values', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createLiteral(true), createLiteral(false))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.a && obj.b', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('a'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('b'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.prop1 || obj.prop2', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('prop1'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('prop2'))
      const node = createLogicalExpression('||', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a.obj && b.obj', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('a'), createIdentifier('obj'))
      const right = createMemberExpression(createIdentifier('b'), createIdentifier('obj'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report case-sensitive different identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createIdentifier('MyVar'),
        createIdentifier('myvar'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty string && non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createStringLiteral(''), createStringLiteral('x'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report single-char difference in string literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createStringLiteral('test1'),
        createStringLiteral('test2'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report negative and positive same absolute value', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createNumericLiteral(-1), createNumericLiteral(1))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with different call expression callees', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('fn1'))
      const right = createCallExpression(createIdentifier('fn2'))
      const node = createLogicalExpression('||', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.fn() && other.fn()', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const calleeLeft = createMemberExpression(createIdentifier('obj'), createIdentifier('fn'))
      const calleeRight = createMemberExpression(createIdentifier('other'), createIdentifier('fn'))
      const left = createCallExpression(calleeLeft)
      const right = createCallExpression(calleeRight)
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report different boolean literal types', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Literal string vs StringLiteral same value (different types)', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral('test'), createStringLiteral('test'))
      visitor.LogicalExpression(node)

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
    })
  })

  describe('non-logical expressions', () => {
    test('should not report binary expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '==',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with operator other than && or ||', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '??',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(() => visitor.LogicalExpression('string')).not.toThrow()
      expect(() => visitor.LogicalExpression(123)).not.toThrow()
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with incomplete loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: {},
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle complex expressions that cannot be compared', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }
      const right = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left,
        right,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle nested member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('inner')),
        createIdentifier('prop'),
      )
      const right = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('inner')),
        createIdentifier('prop'),
      )

      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: null,
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        right: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: undefined,
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: createIdentifier('a'),
        right: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null left and right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: null,
        right: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without operator property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object as left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {},
        right: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
    })

    test('should handle node with array as left and right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: [1, 2, 3],
        right: [1, 2, 3],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
    })

    test('should handle boolean node value', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(() => visitor.LogicalExpression(true)).not.toThrow()
    })

    test('should handle numeric node value', () => {
      const { context } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      expect(() => visitor.LogicalExpression(0)).not.toThrow()
    })

    test('should handle node with loc containing only start', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric identifier name', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = { type: 'Identifier', name: 123 }
      const right = { type: 'Identifier', name: 123 }
      const node = createLogicalExpression('&&', left, right)

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
    })
  })

  describe('location reporting', () => {
    test('should report correct location for AND operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createIdentifier('a'),
        createIdentifier('a'),
        5,
        10,
      )

      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for OR operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createIdentifier('x'),
        createIdentifier('x'),
        10,
        5,
      )

      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'), 3, 5)
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createIdentifier('x'),
        createIdentifier('x'),
        500,
        200,
      )
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'), 0, 0)
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for member expression same sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const node = createLogicalExpression('&&', left, right, 7, 12)

      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report location for call expression same sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('fn'))
      const right = createCallExpression(createIdentifier('fn'))
      const node = createLogicalExpression('||', left, right, 15, 8)

      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location for literal same sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral(42), createLiteral(42), 20, 3)
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should include loc in report descriptor', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'), 2, 4)
      visitor.LogicalExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc).not.toBeNull()
    })

    test('should report location for boolean literal same sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createBooleanLiteral(true),
        createBooleanLiteral(true),
        11,
        22,
      )
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(11)
      expect(reports[0].loc?.start.column).toBe(22)
    })

    test('should report location for string literal same sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createStringLiteral('hi'),
        createStringLiteral('hi'),
        3,
        7,
      )
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report location for numeric literal same sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createNumericLiteral(0),
        createNumericLiteral(0),
        9,
        14,
      )
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(9)
      expect(reports[0].loc?.start.column).toBe(14)
    })

    test('should report location with column offset applied', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createIdentifier('x'),
        createIdentifier('x'),
        1,
        50,
      )
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.column).toBe(50)
      expect(reports[0].loc?.end.column).toBe(60)
    })
  })

  describe('message quality', () => {
    test('should mention operator type in message for AND', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message).toContain('AND')
    })

    test('should mention operator type in message for OR', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message).toContain('OR')
    })

    test('should mention "identical" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('identical')
    })

    test('should mention "redundant" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('redundant')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have string type message', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(typeof reports[0].message).toBe('string')
    })

    test('should mention "sides" in message for AND', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('sides')
    })

    test('should mention "sides" in message for OR', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('sides')
    })

    test('should produce consistent messages for same operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node1 = createLogicalExpression('&&', createIdentifier('x'), createIdentifier('x'))
      visitor.LogicalExpression(node1)
      const msg1 = reports[0].message

      const node2 = createLogicalExpression('&&', createIdentifier('y'), createIdentifier('y'))
      visitor.LogicalExpression(node2)
      const msg2 = reports[1].message

      expect(msg1).toBe(msg2)
    })

    test('should produce different messages for AND vs OR', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const nodeAnd = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(nodeAnd)

      const nodeOr = createLogicalExpression('||', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(nodeOr)

      expect(reports[0].message).not.toBe(reports[1].message)
      expect(reports[0].message).toContain('AND')
      expect(reports[1].message).toContain('OR')
    })
  })

  describe('Literal type (SWC compatibility)', () => {
    test('should detect same Literal with boolean value', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral(true), createLiteral(true))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect same Literal with number value', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral(42), createLiteral(42))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect same Literal with string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createLiteral('test'), createLiteral('test'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report different Literal values', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral('a'), createLiteral('b'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('SWC-specific literals', () => {
    test('should detect same BooleanLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(true),
        createBooleanLiteral(true),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect same NumericLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createNumericLiteral(100),
        createNumericLiteral(100),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect same StringLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createStringLiteral('hello'),
        createStringLiteral('hello'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report different StringLiteral values', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createStringLiteral('foo'),
        createStringLiteral('bar'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple reports', () => {
    test('should report separately for each detected violation', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node1 = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node1)

      const node2 = createLogicalExpression('||', createIdentifier('b'), createIdentifier('b'))
      visitor.LogicalExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      for (let i = 0; i < 5; i++) {
        const node = createLogicalExpression('&&', createIdentifier('x'), createIdentifier('x'))
        visitor.LogicalExpression(node)
      }

      expect(reports.length).toBe(5)
    })

    test('should not accumulate reports for non-violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const validNode = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b'))
      visitor.LogicalExpression(validNode)
      visitor.LogicalExpression(validNode)
      visitor.LogicalExpression(validNode)

      expect(reports.length).toBe(0)
    })

    test('should mix valid and invalid reports correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const invalidNode = createLogicalExpression(
        '&&',
        createIdentifier('a'),
        createIdentifier('a'),
      )
      const validNode = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b'))

      visitor.LogicalExpression(invalidNode)
      visitor.LogicalExpression(validNode)
      visitor.LogicalExpression(invalidNode)

      expect(reports.length).toBe(2)
    })

    test('should report each node independently with different locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node1 = createLogicalExpression(
        '&&',
        createIdentifier('a'),
        createIdentifier('a'),
        1,
        0,
      )
      const node2 = createLogicalExpression(
        '&&',
        createIdentifier('a'),
        createIdentifier('a'),
        5,
        10,
      )

      visitor.LogicalExpression(node1)
      visitor.LogicalExpression(node2)

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should handle rapid alternating valid/invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          const node = createLogicalExpression('&&', createIdentifier('x'), createIdentifier('x'))
          visitor.LogicalExpression(node)
        } else {
          const node = createLogicalExpression('&&', createIdentifier('x'), createIdentifier('y'))
          visitor.LogicalExpression(node)
        }
      }

      expect(reports.length).toBe(5)
    })

    test('should handle many consecutive valid calls followed by invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      for (let i = 0; i < 100; i++) {
        const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b'))
        visitor.LogicalExpression(node)
      }

      const invalidNode = createLogicalExpression(
        '&&',
        createIdentifier('a'),
        createIdentifier('a'),
      )
      visitor.LogicalExpression(invalidNode)

      expect(reports.length).toBe(1)
    })

    test('should report AND and OR violations separately in same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const andNode = createLogicalExpression('&&', createIdentifier('x'), createIdentifier('x'))
      const orNode = createLogicalExpression('||', createIdentifier('y'), createIdentifier('y'))

      visitor.LogicalExpression(andNode)
      visitor.LogicalExpression(orNode)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('AND')
      expect(reports[1].message).toContain('OR')
    })

    test('should handle call after null node input without affecting later reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      visitor.LogicalExpression(null)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle call after undefined node input without affecting later reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      visitor.LogicalExpression(undefined)

      const node = createLogicalExpression('||', createIdentifier('x'), createIdentifier('x'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('config handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a && a',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSameSideConditionsRule.create(context)

      expect(() =>
        visitor.LogicalExpression(
          createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a')),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should work with custom file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a', filePath: '/custom/path/file.ts' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with custom source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'x && x || y', filePath: '/src/file.ts' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('x'), createIdentifier('x'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'a && a',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle config with extra options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true, customFlag: 42 }], source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not be affected by config options for detection', () => {
      const { context, reports } = createMockRuleContext({ options: [{ someOption: 'value' }], source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('x'), createIdentifier('x'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle context with null AST', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      expect(context.getAST()).toBeNull()

      const visitor = noSameSideConditionsRule.create(context)
      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle context with empty tokens', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      expect(context.getTokens()).toEqual([])

      const visitor = noSameSideConditionsRule.create(context)
      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle context with empty comments', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      expect(context.getComments()).toEqual([])

      const visitor = noSameSideConditionsRule.create(context)
      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('operator variations', () => {
    test('should not report ?? operator (nullish coalescing)', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '??',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other logical operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '^',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })

    test('should not report & operator (bitwise AND)', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })

    test('should not report | operator (bitwise OR)', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '|',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty string operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })

    test('should only report && and || operators with same sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const operators = ['&&', '||', '??', '&', '|', '^', '']
      for (const op of operators) {
        const node = {
          type: 'LogicalExpression',
          operator: op,
          left: createIdentifier('x'),
          right: createIdentifier('x'),
        }
        visitor.LogicalExpression?.(node)
      }

      expect(reports.length).toBe(2)
    })
  })

  describe('test.each - identifier detection', () => {
    test.each([
      ['a', '&&', true],
      ['b', '&&', true],
      ['foo', '&&', true],
      ['bar', '&&', true],
      ['myVar', '&&', true],
      ['_private', '&&', true],
      ['$jquery', '&&', true],
      ['a', '||', true],
      ['b', '||', true],
      ['foo', '||', true],
    ])('should%s report for identifier "%s" with %s', (name, op, shouldReport) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(op, createIdentifier(name), createIdentifier(name))
      visitor.LogicalExpression(node)

      if (shouldReport) {
        expect(reports.length).toBe(1)
      } else {
        expect(reports.length).toBe(0)
      }
    })
  })

  describe('test.each - numeric literal detection', () => {
    test.each([
      [0, '&&', true],
      [1, '&&', true],
      [-1, '&&', true],
      [42, '&&', true],
      [3.14, '&&', true],
      [999999, '&&', true],
      [0, '||', true],
      [100, '||', true],
      [-100, '||', true],
      [0.5, '||', true],
    ])('should report same NumericLiteral %s with %s', (value, op, shouldReport) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        op,
        createNumericLiteral(value),
        createNumericLiteral(value),
      )
      visitor.LogicalExpression(node)

      if (shouldReport) {
        expect(reports.length).toBe(1)
      } else {
        expect(reports.length).toBe(0)
      }
    })
  })

  describe('test.each - string literal detection', () => {
    test.each([
      ['', '&&', true],
      ['a', '&&', true],
      ['test', '&&', true],
      ['hello world', '&&', true],
      ['a very long string value for testing', '&&', true],
      ['', '||', true],
      ['b', '||', true],
      ['foo', '||', true],
      ['special chars !@#', '||', true],
      ['unicode \u00e9\u00e8\u00ea', '||', true],
    ])('should report same StringLiteral "%s" with %s', (value, op, shouldReport) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        op,
        createStringLiteral(value),
        createStringLiteral(value),
      )
      visitor.LogicalExpression(node)

      if (shouldReport) {
        expect(reports.length).toBe(1)
      } else {
        expect(reports.length).toBe(0)
      }
    })
  })

  describe('test.each - boolean literal detection', () => {
    test.each([
      [true, '&&', true],
      [false, '&&', true],
      [true, '||', true],
      [false, '||', true],
    ])('should report same BooleanLiteral %s with %s', (value, op, shouldReport) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        op,
        createBooleanLiteral(value),
        createBooleanLiteral(value),
      )
      visitor.LogicalExpression(node)

      if (shouldReport) {
        expect(reports.length).toBe(1)
      } else {
        expect(reports.length).toBe(0)
      }
    })
  })

  describe('test.each - different sides should NOT report', () => {
    test.each([
      ['a', 'b', '&&'],
      ['x', 'y', '||'],
      ['foo', 'bar', '&&'],
      ['a1', 'a2', '&&'],
      ['UPPER', 'lower', '||'],
    ])('should not report different identifiers "%s" vs "%s" with %s', (left, right, op) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(op, createIdentifier(left), createIdentifier(right))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - different numeric values should NOT report', () => {
    test.each([
      [0, 1, '&&'],
      [1, 2, '||'],
      [-1, 1, '&&'],
      [3.14, 2.71, '||'],
      [100, 200, '&&'],
    ])('should not report different numbers %s vs %s with %s', (left, right, op) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        op,
        createNumericLiteral(left),
        createNumericLiteral(right),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - different string values should NOT report', () => {
    test.each([
      ['a', 'b', '&&'],
      ['', 'x', '||'],
      ['hello', 'world', '&&'],
      ['foo', 'bar', '||'],
      ['test1', 'test2', '&&'],
    ])('should not report different strings "%s" vs "%s" with %s', (left, right, op) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        op,
        createStringLiteral(left),
        createStringLiteral(right),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - different boolean values should NOT report', () => {
    test.each([
      [true, false, '&&'],
      [false, true, '||'],
      [true, false, '||'],
      [false, true, '&&'],
    ])('should not report different booleans %s vs %s with %s', (left, right, op) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        op,
        createBooleanLiteral(left),
        createBooleanLiteral(right),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - operator filtering', () => {
    test.each([
      ['&&', true],
      ['||', true],
      ['??', false],
      ['&', false],
      ['|', false],
      ['^', false],
      ['==', false],
      ['!=', false],
      ['+', false],
      ['', false],
    ])('should%s report for operator "%s" with same identifiers', (op, shouldReport) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: op,
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression?.(node)

      if (shouldReport) {
        expect(reports.length).toBe(1)
      } else {
        expect(reports.length).toBe(0)
      }
    })
  })

  describe('test.each - Literal type detection', () => {
    test.each([
      [true, '&&', true],
      [false, '&&', true],
      [42, '&&', true],
      [0, '||', true],
      ['test', '||', true],
      ['', '&&', true],
      ['a', '||', true],
      [true, '||', true],
      [false, '||', true],
      [999, '&&', true],
    ])('should report same Literal value %j with %s', (value, op, shouldReport) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(op, createLiteral(value), createLiteral(value))
      visitor.LogicalExpression(node)

      if (shouldReport) {
        expect(reports.length).toBe(1)
      } else {
        expect(reports.length).toBe(0)
      }
    })
  })

  describe('test.each - edge case inputs', () => {
    test.each([[null], [undefined], ['string'], [123], [true], [false]])(
      'should handle %j input without throwing',
      (input) => {
        const { context } = createMockRuleContext({ source: 'a && a' })
        const visitor = noSameSideConditionsRule.create(context)

        expect(() => visitor.LogicalExpression(input)).not.toThrow()
      },
    )
  })

  describe('test.each - location precision', () => {
    test.each([
      [1, 0],
      [5, 10],
      [100, 50],
      [0, 0],
      [1, 99],
      [999, 0],
      [10, 5],
      [50, 100],
    ])('should report location at line %d, column %d', (line, column) => {
      const { context, reports } = createMockRuleContext({ source: 'a && a' })
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createIdentifier('a'),
        createIdentifier('a'),
        line,
        column,
      )
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })
})
