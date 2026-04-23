import { describe, test, expect, beforeEach, vi } from 'vitest'
import { preferNullishCoalescingRule } from '../../../../src/rules/patterns/prefer-nullish-coalescing.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createLogicalOrExpression(
  rightType: string = 'Identifier',
  line = 1,
  column = 0,
): unknown {
  const right =
    rightType === 'true'
      ? { type: 'Literal', value: true }
      : rightType === 'false'
        ? { type: 'Literal', value: false }
        : { type: 'Identifier', name: 'b' }

  return {
    type: 'LogicalExpression',
    operator: '||',
    left: { type: 'Identifier', name: 'a' },
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLogicalAndExpression(line = 1, column = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '&&',
    left: { type: 'Identifier', name: 'a' },
    right: { type: 'Identifier', name: 'b' },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('prefer-nullish-coalescing rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferNullishCoalescingRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferNullishCoalescingRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferNullishCoalescingRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferNullishCoalescingRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferNullishCoalescingRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
    })

    test('should mention nullish coalescing in description', () => {
      expect(preferNullishCoalescingRule.meta.docs?.description.toLowerCase()).toContain('??')
    })

    test('should mention || in description', () => {
      expect(preferNullishCoalescingRule.meta.docs?.description).toContain('||')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
    })
  })

  describe('detecting || expressions', () => {
    test('should report || with identifier right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('??')
    })

    test('should not report && expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalAndExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report || true pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('true'))

      expect(reports.length).toBe(0)
    })

    test('should not report || false pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('false'))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention falsy values in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toMatch(/falsy|0|""|false/)
    })

    test('should mention nullish coalescing operator in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toContain('??')
    })
  })

  describe('options - ignoreConditionalTests', () => {
    test('should skip || in if statement when option is true', () => {
      const source = 'if (x || y) { }'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: {
          start: { line: 1, column: 4 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report || in if statement when option is false', () => {
      const source = 'if (x || y) { }'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: false }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports.length).toBe(1)
    })

    test('should report || not in if statement even with option true', () => {
      const source = 'const x = a || b;'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression('string')).not.toThrow()
      expect(() => visitor.LogicalExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

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
        getSource: () => 'const x = a || b;',
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

      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(createLogicalOrExpression())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle right node without value property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle nested logical expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Identifier', name: 'c' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('meta - additional properties', () => {
    test('should have docs.url defined', () => {
      expect(preferNullishCoalescingRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof preferNullishCoalescingRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url containing rule name', () => {
      expect(preferNullishCoalescingRule.meta.docs?.url).toContain('prefer-nullish-coalescing')
    })

    test('should have docs.description as a non-empty string', () => {
      expect(typeof preferNullishCoalescingRule.meta.docs?.description).toBe('string')
      expect(preferNullishCoalescingRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention falsy values in description', () => {
      expect(preferNullishCoalescingRule.meta.docs?.description).toMatch(/0|""|false/)
    })

    test('should mention null/undefined in description', () => {
      expect(preferNullishCoalescingRule.meta.docs?.description.toLowerCase()).toMatch(
        /null|undefined/,
      )
    })

    test('should have meta type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferNullishCoalescingRule.meta.type)
    })

    test('should have meta severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(preferNullishCoalescingRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferNullishCoalescingRule.meta.schema)).toBe(true)
    })

    test('should have schema with at least one item', () => {
      expect((preferNullishCoalescingRule.meta.schema as unknown[]).length).toBeGreaterThan(0)
    })

    test('should have ignoreConditionalTests in schema properties', () => {
      const schemaItem = (preferNullishCoalescingRule.meta.schema as Record<string, unknown>[])[0]
      const props = (schemaItem as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('ignoreConditionalTests')
    })

    test('should have ignoreConditionalTests default false in schema', () => {
      const schemaItem = (preferNullishCoalescingRule.meta.schema as Record<string, unknown>[])[0]
      const props = (schemaItem as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.ignoreConditionalTests.default).toBe(false)
    })

    test('should not be deprecated', () => {
      expect(preferNullishCoalescingRule.meta.deprecated).toBeFalsy()
    })

    test('should not require type checking', () => {
      expect(preferNullishCoalescingRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have fixable as code', () => {
      expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
    })

    test('should have meta object defined', () => {
      expect(preferNullishCoalescingRule.meta).toBeDefined()
    })

    test('should have docs object defined', () => {
      expect(preferNullishCoalescingRule.meta.docs).toBeDefined()
    })

    test('should have category as patterns', () => {
      expect(preferNullishCoalescingRule.meta.docs?.category).toBe('patterns')
    })
  })

  describe('create - visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return visitor with LogicalExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)
      expect(typeof visitor.LogicalExpression).toBe('function')
    })

    test('should return a new visitor for each create call', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor1 = preferNullishCoalescingRule.create(context)
      const visitor2 = preferNullishCoalescingRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor LogicalExpression should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)
      expect(visitor.LogicalExpression.length).toBe(1)
    })

    test('should have only expected visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)
      expect(Object.keys(visitor)).toContain('LogicalExpression')
    })

    test('should not throw when create receives context with minimal properties', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '',
      } as unknown as RuleContext

      expect(() => preferNullishCoalescingRule.create(context)).not.toThrow()
    })
  })

  describe('detection - || with various right-side types', () => {
    test('should report || with numeric literal right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with string literal right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 'default' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with null literal right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: null },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with call expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with member expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with object expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'ObjectExpression', properties: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with array expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'ArrayExpression', elements: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with arrow function right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with template literal right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with conditional expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'ConditionalExpression' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with binary expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detection - various left-side types', () => {
    test('should report with member expression left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with call expression left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with literal left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Literal', value: 0 },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with nested || expression left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Identifier', name: 'c' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with array expression left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detection - operators that should not report', () => {
    test('should not report ?? expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '??',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report && expressions with identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with ||-like operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'a' },
        consequent: { type: 'Identifier', name: 'b' },
        alternate: { type: 'Identifier', name: 'c' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report SequenceExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report empty string literal as right side when boolean true', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: true },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right side is boolean false', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: false },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report && even with boolean true right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: true },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting accuracy', () => {
    test('should report location at line 1, column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5, column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100, column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 1, 0))

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report start location before end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 3, 5))

      expect(reports[0].loc!.start.line).toBeLessThanOrEqual(reports[0].loc!.end.line)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.LogicalExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc is empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: {},
      }

      visitor.LogicalExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 1, 9999))

      expect(reports[0].loc?.start.column).toBe(9999)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })
  })

  describe('message content verification', () => {
    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should mention nullish coalescing', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message.toLowerCase()).toMatch(/nullish/)
    })

    test('message should mention || operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toContain('||')
    })

    test('message should mention ?? operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toContain('??')
    })

    test('message should mention falsy values', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toMatch(/falsy/)
    })

    test('message should mention specific falsy examples', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toMatch(/0|""|false/)
    })

    test('message should be consistent across multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('message should not be undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toBeDefined()
    })

    test('message should not be null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).not.toBeNull()
    })
  })

  describe('report descriptor structure', () => {
    test('report should have message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0]).toHaveProperty('message')
    })

    test('report should have loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report loc should have start property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report loc should have end property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start should have line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start should have column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end should have line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('report loc end should have column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })
  })

  describe('multiple reports', () => {
    test('should report multiple separate || expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      visitor.LogicalExpression(createLogicalOrExpression())
      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports.length).toBe(3)
    })

    test('should report two || expressions with different locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 1, 0))
      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 5, 10))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should accumulate reports across calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(2)
    })

    test('should not report for non-|| expressions between || reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      visitor.LogicalExpression(createLogicalAndExpression())
      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports.length).toBe(2)
    })
  })

  describe('options - ignoreConditionalTests - additional', () => {
    test('should skip || when source has if( pattern', () => {
      const source = 'if(x || y) { }'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should skip || when source has "if (" pattern with space', () => {
      const source = '  if (x || y) { }'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 12 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not skip || in assignment context with option true', () => {
      const source = 'const x = a || b;'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should report || in return context with option true', () => {
      const source = 'return a || b;'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should not match iffy as if pattern', () => {
      const source = 'iffy(a || b);'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 11 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not match verify as if pattern', () => {
      const source = 'verify(a || b);'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 13 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle multi-line source with if on different line', () => {
      const source = 'const x = 1;\nif (a || b) { }'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle multi-line source with assignment on different line', () => {
      const source = 'if (x) { }\nconst y = a || b;'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: true }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 2, column: 10 }, end: { line: 2, column: 16 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should use default when options has no ignoreConditionalTests', () => {
      const source = 'if (x || y) { }'
      const { context, reports } = createMockRuleContext({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases - additional', () => {
    test('should handle boolean true node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean false node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression({ type: 'LogicalExpression' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra unexpected properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        extra: 'data',
        nested: { deep: true },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with zero values in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with negative column (unusual but valid)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: -1 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested || expressions (3 levels)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'LogicalExpression',
          operator: '||',
          left: {
            type: 'LogicalExpression',
            operator: '||',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
          right: { type: 'Identifier', name: 'c' },
        },
        right: { type: 'Identifier', name: 'd' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with string type instead of expected type', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression('LogicalExpression')).not.toThrow()
    })

    test('should handle node with number type', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(42)).not.toThrow()
    })

    test('should handle node with array', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression([])).not.toThrow()
    })

    test('should handle right side with numeric literal value 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle right side with empty string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node where loc.start has string values', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: '1', column: '0' }, end: { line: '1', column: '10' } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node where loc has null values', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: null, column: null }, end: { line: null, column: null } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node where loc.start is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: null, end: null },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle || with LogicalExpression && as left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Identifier', name: 'c' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x || y',
        filePath: '/different/path.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with multi-line source', () => {
      const source = 'const a = 1;\nconst b = 2;\nconst c = x || y;'
      const { context, reports } = createMockRuleContext({
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with context that has workspaceRoot', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x || y',
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should work when config has no options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = a || b;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferNullishCoalescingRule.create(context)
      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should work when config options is undefined', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = a || b;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: undefined },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferNullishCoalescingRule.create(context)
      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should work when config options has null first element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = a || b;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferNullishCoalescingRule.create(context)
      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x || y',
        filePath: '/project/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export a RuleDefinition object', () => {
      expect(preferNullishCoalescingRule).toBeDefined()
      expect(typeof preferNullishCoalescingRule).toBe('object')
    })

    test('should have create method as a function', () => {
      expect(typeof preferNullishCoalescingRule.create).toBe('function')
    })

    test('should have meta property as an object', () => {
      expect(typeof preferNullishCoalescingRule.meta).toBe('object')
    })

    test('should have exactly meta and create properties', () => {
      expect(Object.keys(preferNullishCoalescingRule)).toContain('meta')
      expect(Object.keys(preferNullishCoalescingRule)).toContain('create')
    })

    test('create should be callable with mock context', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      expect(() => preferNullishCoalescingRule.create(context)).not.toThrow()
    })
  })

  describe('auto-fix behavior', () => {
    test('should have fixable set to code', () => {
      expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
    })

    test('should have fixable as a truthy value', () => {
      expect(preferNullishCoalescingRule.meta.fixable).toBeTruthy()
    })

    test('should have fixable as a string', () => {
      expect(typeof preferNullishCoalescingRule.meta.fixable).toBe('string')
    })
  })

  describe('detection - mixed operator scenarios', () => {
    test('should report || followed by && in separate nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const orNode = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      const andNode = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'c' },
        right: { type: 'Identifier', name: 'd' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      }

      visitor.LogicalExpression(orNode)
      visitor.LogicalExpression(andNode)

      expect(reports.length).toBe(1)
    })

    test('should report only || expressions in a mix', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.LogicalExpression(createLogicalOrExpression('Identifier', i + 1, 0))
      }

      for (let i = 0; i < 3; i++) {
        visitor.LogicalExpression(createLogicalAndExpression(i + 10, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report || mixed with ??', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      const nullishNode = {
        type: 'LogicalExpression',
        operator: '??',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.LogicalExpression(nullishNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('detection - common patterns', () => {
    test('should report variable || default pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'value' },
        right: { type: 'Identifier', name: 'defaultVal' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report obj.prop || fallback pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'value' },
        },
        right: { type: 'Identifier', name: 'fallback' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report getValue() || default pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getValue' },
          arguments: [],
        },
        right: { type: 'Identifier', name: 'default' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report x || 0 pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report x || "" pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report arr[0] || fallback pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 0 },
          computed: true,
        },
        right: { type: 'Identifier', name: 'fallback' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report || true common pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'condition' },
        right: { type: 'Literal', value: true },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report || false common pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'condition' },
        right: { type: 'Literal', value: false },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('idempotency', () => {
    test('should report same node multiple times when called repeatedly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)
      const node = createLogicalOrExpression()

      visitor.LogicalExpression(node)
      visitor.LogicalExpression(node)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(3)
    })

    test('should produce same message for same node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)
      const node = createLogicalOrExpression()

      visitor.LogicalExpression(node)
      visitor.LogicalExpression(node)

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should produce same location for same node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)
      const node = createLogicalOrExpression()

      visitor.LogicalExpression(node)
      visitor.LogicalExpression(node)

      expect(reports[0].loc).toEqual(reports[1].loc)
    })
  })

  describe('visitor method behavior', () => {
    test('LogicalExpression should return void (not throw)', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const result = visitor.LogicalExpression(createLogicalOrExpression())
      expect(result).toBeUndefined()
    })

    test('LogicalExpression should return void for non-matching node', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const result = visitor.LogicalExpression(createLogicalAndExpression())
      expect(result).toBeUndefined()
    })

    test('LogicalExpression should return void for null node', () => {
      const { context } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const result = visitor.LogicalExpression(null)
      expect(result).toBeUndefined()
    })

    test('LogicalExpression should handle node with undefined operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: undefined,
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('LogicalExpression should handle node with wrong type and || operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('detection - should not report non-boolean literal that is truthy', () => {
    test('should report with right side as undefined identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'undefined' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('extractLocation integration', () => {
    test('should use default location when extractLocation returns defaults for null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(null)
      expect(reports.length).toBe(0)
    })

    test('should preserve exact location from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 42, column: 17 }, end: { line: 42, column: 25 } },
      }

      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
      expect(reports[0].loc?.end.line).toBe(42)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  describe('options handling edge cases', () => {
    test('should handle options with extra unknown properties', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            ignoreConditionalTests: false,
            unknownProp: 'value',
          } as Record<string, unknown>,
        ],
        source: 'const x = a || b;',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })

    test('should handle options with ignoreConditionalTests as truthy non-boolean', () => {
      const source = 'if (x || y) { }'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: 'yes' }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle options with ignoreConditionalTests as 1 (truthy)', () => {
      const source = 'if (x || y) { }'
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: 1 }],
        source: source,
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle options with ignoreConditionalTests as 0 (falsy)', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ ignoreConditionalTests: 0 }],
        source: 'const x = a || b;',
        filePath: '/src/file.ts',
      })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())
      expect(reports.length).toBe(1)
    })
  })

  describe('schema validation', () => {
    test('schema should be an array with exactly one item', () => {
      const schema = preferNullishCoalescingRule.meta.schema as Record<string, unknown>[]
      expect(schema.length).toBe(1)
    })

    test('schema first item should have type object', () => {
      const schema = preferNullishCoalescingRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].type).toBe('object')
    })

    test('schema should have additionalProperties set to false', () => {
      const schema = preferNullishCoalescingRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].additionalProperties).toBe(false)
    })

    test('schema ignoreConditionalTests should have type boolean', () => {
      const schema = preferNullishCoalescingRule.meta.schema as Record<string, unknown>[]
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.ignoreConditionalTests.type).toBe('boolean')
    })
  })

  describe('detection - right side edge cases', () => {
    test('should not report when right side type is Literal and value is boolean true via different ref', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const boolTrue = true
      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: boolTrue },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right side type is Literal and value is boolean false via different ref', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const boolFalse = false
      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: boolFalse },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when right side is NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Map' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when right side is UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when right side is UpdateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when left side is UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'a' },
        },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detection - chained expressions', () => {
    test('should report || with chained || on both sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        },
        right: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'c' },
          right: { type: 'Identifier', name: 'd' },
          loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 16 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report each || in separate calls independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.LogicalExpression({
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: `a${i}` },
          right: { type: 'Identifier', name: `b${i}` },
          loc: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 10 } },
        })
      }

      expect(reports.length).toBe(5)
    })

    test('should report || with function expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'fn' },
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with typeof expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'y' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with spread element right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report || with tagged template expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when right side has Literal type but value matches true', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true, raw: 'true' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('message - comprehensive content checks', () => {
    test('message should contain the word "unexpected"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('message should contain the word "behavior"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message.toLowerCase()).toContain('behavior')
    })

    test('message should have length greater than 50 characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message.length).toBeGreaterThan(50)
    })

    test('message should contain suggestion to use ??', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toMatch(/use.*nullish coalescing/i)
    })

    test('message should not be empty after trimming', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = a || b;' })
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message.trim().length).toBeGreaterThan(0)
    })
  })
})
