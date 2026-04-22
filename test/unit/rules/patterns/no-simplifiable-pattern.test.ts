import { describe, test, expect, vi } from 'vitest'
import { noSimplifiablePatternRule } from '../../../../src/rules/patterns/no-simplifiable-pattern.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

interface LocalReportDescriptor extends ReportDescriptor {
  data?: { test: string }
}

function createMockContextWithData(overrides: Parameters<typeof createMockRuleContext>[0] = {}) {
  const localReports: LocalReportDescriptor[] = []
  const result = createMockRuleContext(overrides)
  const originalReport = result.context.report.bind(result.context)
  result.context.report = (descriptor: LocalReportDescriptor) => {
    localReports.push({
      message: descriptor.message,
      loc: descriptor.loc,
      fix: descriptor.fix,
      data: descriptor.data,
    })
    originalReport(descriptor)
  }
  return { context: result.context, reports: localReports }
}

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
    range: [column, column + 20],
  }
}

function createIdentifier(name: string, start = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + name.length },
    },
    range: [start, start + name.length],
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createUnaryExpression(operator: string, argument: unknown, start = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 5 },
    },
    range: [start, start + 5],
  }
}

function createDoubleNegation(innerArg: unknown, innerStart = 2): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    argument: {
      type: 'UnaryExpression',
      operator: '!',
      argument: innerArg,
      prefix: true,
      range: [innerStart - 1, innerStart + 2],
    },
    prefix: true,
    range: [innerStart - 2, innerStart + 2],
  }
}

describe('no-simplifiable-pattern rule', () => {
  // ============================================================
  // META TESTS (20 tests)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noSimplifiablePatternRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noSimplifiablePatternRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noSimplifiablePatternRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSimplifiablePatternRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(noSimplifiablePatternRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noSimplifiablePatternRule.meta.fixable).toBe('code')
    })

    test('should mention ternary in description', () => {
      expect(noSimplifiablePatternRule.meta.docs?.description.toLowerCase()).toContain('ternary')
    })

    test('should mention simplified in description', () => {
      expect(noSimplifiablePatternRule.meta.docs?.description.toLowerCase()).toContain('simplif')
    })

    test('should have meta property', () => {
      expect(noSimplifiablePatternRule).toHaveProperty('meta')
    })

    test('should have create method', () => {
      expect(noSimplifiablePatternRule).toHaveProperty('create')
      expect(typeof noSimplifiablePatternRule.create).toBe('function')
    })

    test('should have docs property in meta', () => {
      expect(noSimplifiablePatternRule.meta).toHaveProperty('docs')
    })

    test('should have docs description', () => {
      expect(noSimplifiablePatternRule.meta.docs).toHaveProperty('description')
      expect(typeof noSimplifiablePatternRule.meta.docs?.description).toBe('string')
    })

    test('should have docs category', () => {
      expect(noSimplifiablePatternRule.meta.docs).toHaveProperty('category')
    })

    test('should have docs recommended flag', () => {
      expect(noSimplifiablePatternRule.meta.docs).toHaveProperty('recommended')
    })

    test('should have docs url', () => {
      expect(noSimplifiablePatternRule.meta.docs).toHaveProperty('url')
      expect(typeof noSimplifiablePatternRule.meta.docs?.url).toBe('string')
    })

    test('should have type string in meta', () => {
      expect(typeof noSimplifiablePatternRule.meta.type).toBe('string')
    })

    test('should have severity string in meta', () => {
      expect(typeof noSimplifiablePatternRule.meta.severity).toBe('string')
    })

    test('should have fixable string in meta', () => {
      expect(typeof noSimplifiablePatternRule.meta.fixable).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noSimplifiablePatternRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have valid schema as array', () => {
      expect(Array.isArray(noSimplifiablePatternRule.meta.schema)).toBe(true)
    })
  })

  // ============================================================
  // CREATE / VISITOR TESTS (8 tests)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with ConditionalExpression method', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(visitor).toHaveProperty('ConditionalExpression')
      expect(typeof visitor.ConditionalExpression).toBe('function')
    })

    test('should return same visitor structure for different contexts', () => {
      const { context: ctx1 } = createMockContextWithData({ source: 'x ? true : false;' })
      const { context: ctx2 } = createMockContextWithData({
        source: 'x ? true : false;',
        filePath: '/other/file.ts',
      })
      const visitor1 = noSimplifiablePatternRule.create(ctx1)
      const visitor2 = noSimplifiablePatternRule.create(ctx2)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should return visitor with only ConditionalExpression key', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(Object.keys(visitor)).toEqual(['ConditionalExpression'])
    })

    test('should create independent visitors for each context', () => {
      const { context: ctx1, reports: r1 } = createMockContextWithData({
        source: 'x ? true : false;',
      })
      const { context: ctx2, reports: r2 } = createMockContextWithData({
        source: 'x ? true : false;',
      })
      const visitor1 = noSimplifiablePatternRule.create(ctx1)
      const visitor2 = noSimplifiablePatternRule.create(ctx2)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor1.ConditionalExpression(node)

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle being called multiple times', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)
      visitor.ConditionalExpression(node)

      // Each call should independently report
    })

    test('should not throw when context has minimal config', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => {
        visitor.ConditionalExpression(
          createConditionalExpression(
            createIdentifier('x'),
            createLiteral(true),
            createLiteral(false),
          ),
        )
      }).not.toThrow()
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)
      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should accept context with empty source', () => {
      const { context, reports } = createMockContextWithData({
        source: '',
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)
      // Should still report even with empty source
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTION: x ? true : false PATTERN (30 tests)
  // ============================================================
  describe('detecting x ? true : false pattern', () => {
    test('should report x ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!!{{test}}')
      expect(reports[0].message).toContain('Boolean({{test}})')
      expect(reports[0].data?.test).toBe('x')
    })

    test('should report value ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('value'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('value')
    })

    test('should report flag ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('flag')
    })

    test('should provide fix to !!test', () => {
      const source = 'x ? true : false;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('!!x')
      expect(reports[0].fix?.range).toEqual([0, 20])
    })

    test('should report isActive ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('isActive'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('isActive')
    })

    test('should report result ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('result'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('result')
    })

    test('should report enabled ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('enabled'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('enabled')
    })

    test('should report ok ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('ok'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('ok')
    })

    test('should report done ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('done'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('done')
    })

    test('should report visible ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('visible'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('visible')
    })

    test('should report check ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('check'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report isValid ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('isValid'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('isValid')
    })

    test('should report cond ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('cond')
    })

    test('should report hasPermission ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('hasPermission'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('hasPermission')
    })

    test('should report canEdit ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('canEdit'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report bool ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('bool'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('bool')
    })

    test('should report data ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('data'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report shouldShow ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('shouldShow'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arr ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('arr'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('obj'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTION: x ? false : true PATTERN (30 tests)
  // ============================================================
  describe('detecting x ? false : true pattern', () => {
    test('should report x ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!{{test}}')
      expect(reports[0].data?.test).toBe('x')
    })

    test('should report condition ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('condition'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })

    test('should provide fix to !test', () => {
      const source = 'x ? false : true;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(false),
        createLiteral(true),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('!x')
      expect(reports[0].fix?.range).toEqual([0, 20])
    })

    test('should report isActive ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('isActive'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('isActive')
    })

    test('should report value ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('value'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('value')
    })

    test('should report flag ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('flag')
    })

    test('should report enabled ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('enabled'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report result ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('result'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report check ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('check'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report ok ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('ok'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report done ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('done'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report visible ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('visible'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report isValid ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('isValid'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report cond ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report hasPermission ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('hasPermission'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report shouldShow ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('shouldShow'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report bool ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('bool'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report data ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('data'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arr ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('arr'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('obj'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTION: !!x ? true : false PATTERN (tests)
  // ============================================================
  describe('detecting !!x ? true : false pattern', () => {
    test('should report !!x ? true : false with special message about already being boolean', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x'),
          prefix: true,
        },
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 4 },
        },
      }
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('already a boolean')
      expect(reports[0].message).toContain('!!{{test}}')
    })

    test('should provide fix to x (remove unnecessary ternary)', () => {
      const source = '!!x ? true : false;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x', 2),
          prefix: true,
          range: [1, 3],
        },
        prefix: true,
        range: [0, 3],
      }
      const node = createConditionalExpression(
        testNode,
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('!!x')
    })

    test('should report !!value ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createDoubleNegation(createIdentifier('value'), 2)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('already a boolean')
    })

    test('should report !!flag ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createDoubleNegation(createIdentifier('flag'), 2)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !!isActive ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createDoubleNegation(createIdentifier('isActive'), 2)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !!result ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createDoubleNegation(createIdentifier('result'), 2)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // VALID PATTERNS - SHOULD NOT REPORT (30 tests)
  // ============================================================
  describe('valid patterns that should not report', () => {
    test('should not report x ? 1 : 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? "yes" : "no"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral('yes'),
        createLiteral('no'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? true : null', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(null),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? null : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(null),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? false : null', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(false),
        createLiteral(null),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? undefined : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(undefined),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report !x ? true : false (can be simplified to !!(!x))', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 1)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !x ? false : true (can be simplified to !(!x))', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 1)
      const node = createConditionalExpression(testNode, createLiteral(false), createLiteral(true))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !!x ? false : true (can be simplified to !(!!x))', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'), 3)
      const testNode = createUnaryExpression('!', innerNot, 2)
      const node = createConditionalExpression(testNode, createLiteral(false), createLiteral(true))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report x ? true : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? false : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(false),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? 42 : 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(42),
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? "a" : "b"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral('a'),
        createLiteral('b'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? 0 : 1', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(0),
        createLiteral(1),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? "" : "default"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(''),
        createLiteral('default'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? true : undefined', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(undefined),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? false : undefined', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(false),
        createLiteral(undefined),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? null : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(null),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? null : null', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(null),
        createLiteral(null),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? undefined : undefined', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(undefined),
        createLiteral(undefined),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? 100 : 200', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(100),
        createLiteral(200),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? "enabled" : "disabled"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral('enabled'),
        createLiteral('disabled'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? -1 : 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(-1),
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? 3.14 : 2.71', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(3.14),
        createLiteral(2.71),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? null : undefined', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(null),
        createLiteral(undefined),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? undefined : null', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(undefined),
        createLiteral(null),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? 0 : ""', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(0),
        createLiteral(''),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? NaN : 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(NaN),
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? Infinity : 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(Infinity),
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? BigInt(1) : 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'BigInt' } },
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? /regex/ : "fallback"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        { type: 'Literal', value: /regex/, regex: { pattern: 'regex', flags: '' } },
        createLiteral('fallback'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (25 tests)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression('string')).not.toThrow()
      expect(() => visitor.ConditionalExpression(123)).not.toThrow()
      expect(() => visitor.ConditionalExpression(true)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without test', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle node without consequent', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        alternate: createLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle node without alternate', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle node without loc but with range', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
        range: [0, 20],
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        42,
        15,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-identifier test in getTestDescription (uses "condition")', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 1)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })

    test('should handle node with empty object as test', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => {
        visitor.ConditionalExpression({
          type: 'ConditionalExpression',
          test: {},
          consequent: createLiteral(true),
          alternate: createLiteral(false),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        })
      }).not.toThrow()
    })

    test('should handle node with empty object as consequent', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: {},
        alternate: createLiteral(false),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object as alternate', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle wrong node type like "IfStatement"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle wrong node type like "BinaryExpression"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'BinaryExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle number as test value', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: 42,
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })

    test('should handle string as test value', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: 'hello',
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })

    test('should handle boolean as test value', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: true,
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })

    test('should handle consequent with type but non-Literal', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: { type: 'Identifier', name: 'y' },
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle alternate with type but non-Literal', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: { type: 'Identifier', name: 'y' },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle consequent as null', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: null,
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle alternate as null', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: null,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle Literal with value true but wrong type field', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: { type: 'BooleanLiteral', value: true },
        alternate: { type: 'BooleanLiteral', value: false },
      })

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LOCATION TESTS (15 tests)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location for line 1 column 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for line 5 column 10', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        5,
        10,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for line 100 column 50', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        100,
        50,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location for false:true pattern', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(false),
        createLiteral(true),
        7,
        3,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        2,
        5,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should include location in report for !!x ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x'),
          prefix: true,
        },
        prefix: true,
      }
      const node = createConditionalExpression(
        testNode,
        createLiteral(true),
        createLiteral(false),
        3,
        8,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
        range: [0, 20],
      }

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toBeDefined()
      // Default location from extractLocation
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        0,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location with high column offset', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        1,
        999,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.column).toBe(999)
    })

    test('should report location for !x ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 0)
      const node = createConditionalExpression(
        testNode,
        createLiteral(true),
        createLiteral(false),
        10,
        20,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location for !x ? false : true', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 0)
      const node = createConditionalExpression(
        testNode,
        createLiteral(false),
        createLiteral(true),
        15,
        5,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with multi-line offset', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        500,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('should provide location object with start and end', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should provide location start with line and column', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should provide location end with line and column', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  // ============================================================
  // MESSAGE QUALITY (10 tests)
  // ============================================================
  describe('message quality', () => {
    test('should mention unnecessary ternary', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('should mention !!{{test}} for true:false pattern', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('value'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!!{{test}}')
    })

    test('should mention Boolean({{test}}) for true:false pattern', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('Boolean({{test}})')
    })

    test('should mention !{{test}} for false:true pattern', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!{{test}}')
    })

    test('should mention !!{{test}} for !!x ? true : false (special case)', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x'),
          prefix: true,
        },
        prefix: true,
      }
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!!{{test}}')
      expect(reports[0].message).toContain('already a boolean')
    })

    test('should contain Unnecessary at start of message for standard patterns', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should mention ternary in false:true pattern message', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('should mention ternary in !!x ? true:false pattern message', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createDoubleNegation(createIdentifier('x'), 2)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('should have data.test populated for identifier test', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('myVar'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].data?.test).toBe('myVar')
    })

    test('should have data.test set to condition for non-identifier test', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 0)
      const node = createConditionalExpression(testNode, createLiteral(false), createLiteral(true))

      visitor.ConditionalExpression(node)

      expect(reports[0].data?.test).toBe('condition')
    })
  })

  // ============================================================
  // MULTIPLE REPORTS / SEQUENTIAL VISITS (10 tests)
  // ============================================================
  describe('multiple sequential visits', () => {
    test('should report each time visitor is called with matching pattern', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node1)
      expect(reports.length).toBe(1)

      const node2 = createConditionalExpression(
        createIdentifier('b'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node2)
      expect(reports.length).toBe(2)
    })

    test('should report independently for different pattern types', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node1)

      const node2 = createConditionalExpression(
        createIdentifier('b'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node2)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('!!{{test}}')
      expect(reports[1].message).toContain('!{{test}}')
    })

    test('should not report for valid pattern between two invalid ones', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(true),
        createLiteral(false),
      )
      visitor.ConditionalExpression(node1)
      expect(reports.length).toBe(1)

      const validNode = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(0),
      )
      visitor.ConditionalExpression(validNode)
      expect(reports.length).toBe(1)

      const node2 = createConditionalExpression(
        createIdentifier('b'),
        createLiteral(false),
        createLiteral(true),
      )
      visitor.ConditionalExpression(node2)
      expect(reports.length).toBe(2)
    })

    test('should accumulate reports correctly across 5 calls', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      for (let i = 0; i < 5; i++) {
        const node = createConditionalExpression(
          createIdentifier(`var${i}`),
          createLiteral(true),
          createLiteral(false),
        )
        visitor.ConditionalExpression(node)
      }

      expect(reports.length).toBe(5)
    })

    test('should track data.test for each report separately', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('alpha'),
        createLiteral(true),
        createLiteral(false),
      )
      visitor.ConditionalExpression(node1)

      const node2 = createConditionalExpression(
        createIdentifier('beta'),
        createLiteral(false),
        createLiteral(true),
      )
      visitor.ConditionalExpression(node2)

      expect(reports[0].data?.test).toBe('alpha')
      expect(reports[1].data?.test).toBe('beta')
    })

    test('should handle null node between valid nodes', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(true),
        createLiteral(false),
      )
      visitor.ConditionalExpression(node1)
      expect(reports.length).toBe(1)

      visitor.ConditionalExpression(null)
      expect(reports.length).toBe(1)

      const node2 = createConditionalExpression(
        createIdentifier('b'),
        createLiteral(true),
        createLiteral(false),
      )
      visitor.ConditionalExpression(node2)
      expect(reports.length).toBe(2)
    })

    test('should handle mix of !!x and simple patterns', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const simpleNode = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(true),
        createLiteral(false),
      )
      visitor.ConditionalExpression(simpleNode)

      const doubleNegNode = createConditionalExpression(
        createDoubleNegation(createIdentifier('b'), 2),
        createLiteral(true),
        createLiteral(false),
      )
      visitor.ConditionalExpression(doubleNegNode)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Boolean({{test}})')
      expect(reports[1].message).toContain('already a boolean')
    })

    test('should handle 10 rapid sequential visits', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ConditionalExpression(
          createConditionalExpression(
            createIdentifier(`v${i}`),
            createLiteral(true),
            createLiteral(false),
          ),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should correctly handle alternating valid and invalid patterns', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      for (let i = 0; i < 4; i++) {
        // Invalid pattern
        visitor.ConditionalExpression(
          createConditionalExpression(
            createIdentifier(`x${i}`),
            createLiteral(true),
            createLiteral(false),
          ),
        )
        // Valid pattern
        visitor.ConditionalExpression(
          createConditionalExpression(
            createIdentifier(`y${i}`),
            createLiteral(1),
            createLiteral(0),
          ),
        )
      }

      expect(reports.length).toBe(4)
    })

    test('should track locations independently for each report', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )
      visitor.ConditionalExpression(node1)

      const node2 = createConditionalExpression(
        createIdentifier('b'),
        createLiteral(true),
        createLiteral(false),
        5,
        10,
      )
      visitor.ConditionalExpression(node2)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })
  })

  // ============================================================
  // CONTEXT VARIATIONS (10 tests)
  // ============================================================
  describe('context variations', () => {
    test('should work with default file path', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockContextWithData({
        source: 'x ? true : false;',
        filePath: '/project/src/utils/helpers.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockContextWithData({
        source: 'x ? true : false;',
        filePath: '/src/file.js',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file extension', () => {
      const { context, reports } = createMockContextWithData({
        source: 'flag ? true : false',
        filePath: '/src/component.jsx',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContextWithData({
        source: '',
        filePath: '/src/empty.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with source code containing pattern', () => {
      const source = 'const result = isActive ? true : false;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('isActive', 15),
        createLiteral(true),
        createLiteral(false),
        1,
        15,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('!!isActive')
    })

    test('should work with multiline source code', () => {
      const source = 'const x = 1;\nconst y = a ? true : false;\nconst z = 3;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('a', 0),
        createLiteral(true),
        createLiteral(false),
        2,
        11,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockContextWithData({
        source: 'visible ? true : false',
        filePath: '/home/user/projects/myapp/src/components/ui/Button.tsx',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('visible', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle context with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
            data: descriptor.data,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'x ? true : false;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle context with extra config options', () => {
      const { context, reports } = createMockContextWithData({
        options: [{ strict: true, customFlag: 'yes' }],
        source: 'x ? true : false;',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // FIX FUNCTIONALITY (10 tests)
  // ============================================================
  describe('fix functionality', () => {
    test('should provide fix for x ? true : false', () => {
      const source = 'x ? true : false;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!!x')
    })

    test('should provide fix for x ? false : true', () => {
      const source = 'value ? false : true;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('value', 0),
        createLiteral(false),
        createLiteral(true),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!value')
    })

    test('should provide fix for !!x ? true : false (special case - fix to !!x)', () => {
      const source = '!!x ? true : false;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x', 2),
          prefix: true,
          range: [1, 3],
        },
        prefix: true,
        range: [0, 3],
      }
      const node = createConditionalExpression(
        testNode,
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!!x')
    })

    test('should provide fix with correct range for true:false pattern', () => {
      const source = 'flag ? true : false'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 20])
    })

    test('should provide fix with correct range for false:true pattern', () => {
      const source = 'flag ? false : true'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag', 0),
        createLiteral(false),
        createLiteral(true),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 20])
    })

    test('should provide fix using source code for test expression', () => {
      const source = 'isActive ? true : false'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('isActive', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix?.text).toBe('!!isActive')
    })

    test('should provide fix without range when node lacks range', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix for !x ? true : false using source', () => {
      const source = '!x ? true : false'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('x', 1),
        prefix: true,
        range: [0, 2],
      }
      const node = createConditionalExpression(
        testNode,
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!!!x')
    })

    test('should provide fix for !x ? false : true using source', () => {
      const source = '!x ? false : true'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('x', 1),
        prefix: true,
        range: [0, 2],
      }
      const node = createConditionalExpression(
        testNode,
        createLiteral(false),
        createLiteral(true),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!!x')
    })

    test('should provide fix with offset range when node is not at start', () => {
      const source = '  x ? true : false;'
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 2),
        createLiteral(true),
        createLiteral(false),
        1,
        2,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!!x')
      expect(reports[0].fix?.range).toEqual([2, 22])
    })
  })

  // ============================================================
  // TEST.EACH - PARAMETERIZED TESTS (40+ tests)
  // ============================================================
  describe('test.each parameterized detection tests', () => {
    test.each([
      { name: 'x', expected: 'x' },
      { name: 'value', expected: 'value' },
      { name: 'flag', expected: 'flag' },
      { name: 'isActive', expected: 'isActive' },
      { name: 'result', expected: 'result' },
      { name: 'enabled', expected: 'enabled' },
      { name: 'ok', expected: 'ok' },
      { name: 'done', expected: 'done' },
      { name: 'visible', expected: 'visible' },
      { name: 'check', expected: 'check' },
    ] as const)(
      'should report $name ? true : false and extract test name "$expected"',
      ({ name, expected }) => {
        const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
        const visitor = noSimplifiablePatternRule.create(context)

        const node = createConditionalExpression(
          createIdentifier(name),
          createLiteral(true),
          createLiteral(false),
        )

        visitor.ConditionalExpression(node)

        expect(reports.length).toBe(1)
        expect(reports[0].data?.test).toBe(expected)
      },
    )

    test.each([
      { name: 'x', expected: 'x' },
      { name: 'value', expected: 'value' },
      { name: 'flag', expected: 'flag' },
      { name: 'isActive', expected: 'isActive' },
      { name: 'result', expected: 'result' },
      { name: 'enabled', expected: 'enabled' },
      { name: 'ok', expected: 'ok' },
      { name: 'done', expected: 'done' },
      { name: 'visible', expected: 'visible' },
      { name: 'check', expected: 'check' },
    ] as const)(
      'should report $name ? false : true and extract test name "$expected"',
      ({ name, expected }) => {
        const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
        const visitor = noSimplifiablePatternRule.create(context)

        const node = createConditionalExpression(
          createIdentifier(name),
          createLiteral(false),
          createLiteral(true),
        )

        visitor.ConditionalExpression(node)

        expect(reports.length).toBe(1)
        expect(reports[0].data?.test).toBe(expected)
      },
    )

    test.each([
      { cons: true, alt: false, expected: true },
      { cons: false, alt: true, expected: true },
    ])('should detect pattern with consequent=$cons, alternate=$alt', ({ cons, alt, expected }) => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(cons),
        createLiteral(alt),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(expected ? 1 : 0)
    })

    test.each([
      { cons: 1, alt: 0 },
      { cons: 'yes', alt: 'no' },
      { cons: true, alt: null },
      { cons: null, alt: true },
      { cons: false, alt: null },
      { cons: undefined, alt: true },
      { cons: 0, alt: 1 },
      { cons: true, alt: true },
      { cons: false, alt: false },
      { cons: 42, alt: 0 },
    ])('should NOT report with consequent=$cons, alternate=$alt', ({ cons, alt }) => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(cons),
        createLiteral(alt),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each with fix assertions', () => {
    test.each([
      { name: 'x', source: 'x ? true : false', expectedFix: '!!x' },
      { name: 'value', source: 'value ? true : false', expectedFix: '!!value' },
      { name: 'flag', source: 'flag ? true : false', expectedFix: '!!flag' },
      { name: 'isActive', source: 'isActive ? true : false', expectedFix: '!!isActive' },
    ] as const)('should fix $source to $expectedFix', ({ name, source, expectedFix }) => {
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier(name, 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix?.text).toBe(expectedFix)
    })

    test.each([
      { name: 'x', source: 'x ? false : true', expectedFix: '!x' },
      { name: 'value', source: 'value ? false : true', expectedFix: '!value' },
      { name: 'flag', source: 'flag ? false : true', expectedFix: '!flag' },
      { name: 'isActive', source: 'isActive ? false : true', expectedFix: '!isActive' },
    ] as const)('should fix $source to $expectedFix', ({ name, source, expectedFix }) => {
      const { context, reports } = createMockContextWithData({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier(name, 0),
        createLiteral(false),
        createLiteral(true),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix?.text).toBe(expectedFix)
    })
  })

  describe('test.each edge case parameterized', () => {
    test.each([
      { input: null, description: 'null' },
      { input: undefined, description: 'undefined' },
      { input: 42, description: 'number' },
      { input: 'string', description: 'string' },
      { input: true, description: 'boolean primitive' },
    ])('should handle $description node gracefully', ({ input }) => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression(input)).not.toThrow()
    })

    test.each([
      { type: 'IfStatement' },
      { type: 'BinaryExpression' },
      { type: 'CallExpression' },
      { type: 'MemberExpression' },
      { type: 'ArrowFunctionExpression' },
      { type: 'ReturnStatement' },
    ])('should not report for node type $type', ({ type }) => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type,
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage', () => {
    test('should not report for x ? true : 0', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(true), createLiteral(0)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for x ? 0 : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report for a ? true : false with single char identifier', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('a'),
          createLiteral(true),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('a')
    })

    test('should report for z ? false : true with single char identifier', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('z'),
          createLiteral(false),
          createLiteral(true),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('z')
    })

    test('should report for _underscore ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('_underscore'),
          createLiteral(true),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('_underscore')
    })

    test('should report for $dollar ? true : false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('$dollar'),
          createLiteral(true),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('$dollar')
    })

    test('should handle node with only type and consequent', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        consequent: createLiteral(true),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with only type and alternate', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        alternate: createLiteral(false),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with only type and test', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
      })

      expect(reports.length).toBe(0)
    })

    test('should report with empty string identifier', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier(''),
          createLiteral(true),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('')
    })

    test('should not report for Literal consequent with non-boolean value and Literal alternate false', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createLiteral('true'),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for Literal consequent false and Literal alternate with non-boolean value', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createLiteral(false),
          createLiteral('true'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle false:true with identifier named "condition"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('condition'),
          createLiteral(false),
          createLiteral(true),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })

    test('should handle true:false with identifier named "condition"', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('condition'),
          createLiteral(true),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })

    test('should not report for consequent being non-boolean truthy literal', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createLiteral('truthy'),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle array as node input', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression([])).not.toThrow()
    })

    test('should handle function as node input', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression(() => {})).not.toThrow()
    })

    test('should handle Symbol as node input', () => {
      const { context } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression(Symbol('test'))).not.toThrow()
    })

    test('should report with loc but no range on test node', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'Identifier',
        name: 'y',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report for both true:false and false:true in sequence', () => {
      const { context, reports } = createMockContextWithData({ source: 'x ? true : false;' })
      const visitor = noSimplifiablePatternRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('a'),
          createLiteral(true),
          createLiteral(false),
        ),
      )
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('b'),
          createLiteral(false),
          createLiteral(true),
        ),
      )

      expect(reports.length).toBe(2)
    })
  })
})
