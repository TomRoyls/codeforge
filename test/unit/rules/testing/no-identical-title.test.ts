import { describe, test, expect, vi } from 'vitest'
import { noIdenticalTitleRule } from '../../../../src/rules/testing/no-identical-title.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'it("test", () => {});',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createCallExpression(
  functionName: string,
  title: string | null,
  line = 1,
  column = 0,
): unknown {
  const args: unknown[] = []
  if (title !== null) {
    args.push({ type: 'Literal', value: title })
  }
  args.push({ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } })

  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: functionName },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createDescribeCall(
  title: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: title },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createMemberCallExpression(
  objectName: string,
  propertyName: string,
  title: string | null,
  line = 1,
  column = 0,
): unknown {
  const args: unknown[] = []
  if (title !== null) {
    args.push({ type: 'Literal', value: title })
  }
  args.push({ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } })

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createTemplateLiteralCall(
  functionName: string,
  rawValue: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: functionName },
    arguments: [
      {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { cooked: rawValue, raw: rawValue } }],
        expressions: [],
      },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

describe('no-identical-title rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noIdenticalTitleRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noIdenticalTitleRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noIdenticalTitleRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noIdenticalTitleRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(noIdenticalTitleRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning duplicate titles', () => {
      expect(noIdenticalTitleRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })

    test('should have a docs.url property', () => {
      expect(noIdenticalTitleRule.meta.docs?.url).toBeDefined()
      expect(typeof noIdenticalTitleRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noIdenticalTitleRule.meta.schema)).toBe(true)
    })

    test('should have schema with ignoreContext property', () => {
      const schema = noIdenticalTitleRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('ignoreContext')
    })

    test('should have ignoreContext default of false', () => {
      const schema = noIdenticalTitleRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, Record<string, unknown>>
      expect(properties.ignoreContext.default).toBe(false)
    })

    test('should have ignoreContext type boolean', () => {
      const schema = noIdenticalTitleRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, Record<string, unknown>>
      expect(properties.ignoreContext.type).toBe('boolean')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return visitor with CallExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      expect(visitor).toHaveProperty('CallExpression:exit')
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })

    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noIdenticalTitleRule.create(ctx1)
      const visitor2 = noIdenticalTitleRule.create(ctx2)

      visitor1.CallExpression(createCallExpression('it', 'test a'))
      visitor1.CallExpression(createCallExpression('it', 'test a'))

      visitor2.CallExpression(createCallExpression('it', 'test b'))
      visitor2.CallExpression(createCallExpression('it', 'test b'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  describe('no violations for unique titles', () => {
    test('should not report when all it titles are unique', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'test a'))
      visitor.CallExpression(createCallExpression('it', 'test b'))
      visitor.CallExpression(createCallExpression('it', 'test c'))

      expect(reports.length).toBe(0)
    })

    test('should not report when all test titles are unique', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('test', 'first test'))
      visitor.CallExpression(createCallExpression('test', 'second test'))

      expect(reports.length).toBe(0)
    })

    test('should not report when describe titles are unique', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('group a'))
      visitor['CallExpression:exit'](createDescribeCall('group a'))
      visitor.CallExpression(createDescribeCall('group b'))
      visitor['CallExpression:exit'](createDescribeCall('group b'))

      expect(reports.length).toBe(0)
    })

    test('should not report for unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [{ type: 'Literal', value: 'log' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for a single test title', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'only test'))

      expect(reports.length).toBe(0)
    })
  })

  describe('detects duplicate it titles', () => {
    test('should report duplicate it titles in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'same title'))
      visitor.CallExpression(createCallExpression('it', 'same title'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for duplicate it titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'my test'))
      visitor.CallExpression(createCallExpression('it', 'my test'))

      expect(reports[0].message).toContain('my test')
      expect(reports[0].message).toContain('Unexpected duplicate test title')
    })

    test('should report correct location for duplicate it', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'dup', 1, 0))
      visitor.CallExpression(createCallExpression('it', 'dup', 5, 4))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report only the second occurrence', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'dup'))
      visitor.CallExpression(createCallExpression('it', 'unique'))
      visitor.CallExpression(createCallExpression('it', 'dup'))

      expect(reports.length).toBe(1)
    })

    test('should report multiple duplicates of same title', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'triple'))
      visitor.CallExpression(createCallExpression('it', 'triple'))
      visitor.CallExpression(createCallExpression('it', 'triple'))

      expect(reports.length).toBe(2)
    })
  })

  describe('detects duplicate test titles', () => {
    test('should report duplicate test titles in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('test', 'same'))
      visitor.CallExpression(createCallExpression('test', 'same'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for duplicate test titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('test', 'my test'))
      visitor.CallExpression(createCallExpression('test', 'my test'))

      expect(reports[0].message).toContain('my test')
      expect(reports[0].message).toContain('Unexpected duplicate test title')
    })

    test('should report duplicate test with member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createMemberCallExpression('test', 'skip', 'skipped'))
      visitor.CallExpression(createMemberCallExpression('test', 'skip', 'skipped'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate across it and test with same title', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'same title'))
      visitor.CallExpression(createCallExpression('test', 'same title'))

      expect(reports.length).toBe(1)
    })

    test('should not report unique test titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('test', 'first'))
      visitor.CallExpression(createCallExpression('test', 'second'))
      visitor.CallExpression(createCallExpression('test', 'third'))

      expect(reports.length).toBe(0)
    })
  })

  describe('detects duplicate describe titles', () => {
    test('should report duplicate describe titles in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('group'))
      visitor['CallExpression:exit'](createDescribeCall('group'))
      visitor.CallExpression(createDescribeCall('group'))
      visitor['CallExpression:exit'](createDescribeCall('group'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for duplicate describe titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('MySuite'))
      visitor['CallExpression:exit'](createDescribeCall('MySuite'))
      visitor.CallExpression(createDescribeCall('MySuite'))
      visitor['CallExpression:exit'](createDescribeCall('MySuite'))

      expect(reports[0].message).toContain('MySuite')
    })

    test('should detect duplicate context titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('context', 'when foo'))
      visitor['CallExpression:exit'](createCallExpression('context', 'when foo'))
      visitor.CallExpression(createCallExpression('context', 'when foo'))
      visitor['CallExpression:exit'](createCallExpression('context', 'when foo'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate specify titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('specify', 'should work'))
      visitor.CallExpression(createCallExpression('specify', 'should work'))

      expect(reports.length).toBe(1)
    })

    test('should not report unique describe titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('group a'))
      visitor['CallExpression:exit'](createDescribeCall('group a'))
      visitor.CallExpression(createDescribeCall('group b'))
      visitor['CallExpression:exit'](createDescribeCall('group b'))

      expect(reports.length).toBe(0)
    })
  })

  describe('allows same title in different describe blocks', () => {
    test('should allow same it title in different describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('outer'))
      visitor.CallExpression(createCallExpression('it', 'should work'))
      visitor['CallExpression:exit'](createDescribeCall('outer'))

      visitor.CallExpression(createDescribeCall('outer2'))
      visitor.CallExpression(createCallExpression('it', 'should work'))
      visitor['CallExpression:exit'](createDescribeCall('outer2'))

      expect(reports.length).toBe(0)
    })

    test('should allow same test title in nested vs outer scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('test', 'checks something'))
      visitor.CallExpression(createDescribeCall('inner'))
      visitor.CallExpression(createCallExpression('test', 'checks something'))
      visitor['CallExpression:exit'](createDescribeCall('inner'))

      expect(reports.length).toBe(0)
    })

    test('should report duplicate within nested describe but allow same in sibling', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('sibling1'))
      visitor.CallExpression(createCallExpression('it', 'case'))
      visitor.CallExpression(createCallExpression('it', 'case'))
      visitor['CallExpression:exit'](createDescribeCall('sibling1'))

      visitor.CallExpression(createDescribeCall('sibling2'))
      visitor.CallExpression(createCallExpression('it', 'case'))
      visitor['CallExpression:exit'](createDescribeCall('sibling2'))

      expect(reports.length).toBe(1)
    })

    test('should allow same title at different nesting levels', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'top level'))
      visitor.CallExpression(createDescribeCall('nested'))
      visitor.CallExpression(createCallExpression('it', 'top level'))
      visitor['CallExpression:exit'](createDescribeCall('nested'))

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('level 1'))
      visitor.CallExpression(createCallExpression('it', 'deep test'))
      visitor.CallExpression(createDescribeCall('level 2'))
      visitor.CallExpression(createCallExpression('it', 'deep test'))
      visitor['CallExpression:exit'](createDescribeCall('level 2'))
      visitor['CallExpression:exit'](createDescribeCall('level 1'))

      expect(reports.length).toBe(0)
    })
  })

  describe('handles missing or empty titles', () => {
    test('should not crash on call with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not crash when first argument is not a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Identifier', name: 'dynamicTitle' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle empty string title', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', ''))
      visitor.CallExpression(createCallExpression('it', ''))

      expect(reports.length).toBe(1)
    })

    test('should handle non-string literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 42 },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 42 },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle null first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: null },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('template literal titles', () => {
    test('should handle template literal titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createTemplateLiteralCall('it', 'template test'))
      visitor.CallExpression(createTemplateLiteralCall('it', 'template test'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate between literal and template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'same title'))
      visitor.CallExpression(createTemplateLiteralCall('it', 'same title'))

      expect(reports.length).toBe(1)
    })

    test('should not report different template literal titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createTemplateLiteralCall('it', 'first template'))
      visitor.CallExpression(createTemplateLiteralCall('it', 'second template'))

      expect(reports.length).toBe(0)
    })

    test('should handle template literal with raw fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      const node1 = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', raw: 'raw title', value: { cooked: 'raw title', raw: 'raw title' } }],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      const node2 = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', raw: 'raw title', value: { cooked: 'raw title', raw: 'raw title' } }],
            expressions: [],
          },
        ],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      }

      visitor.CallExpression(node1)
      visitor.CallExpression(node2)

      expect(reports.length).toBe(1)
    })
  })

  describe('ignoreContext option', () => {
    test('should skip context blocks when ignoreContext is true', () => {
      const { context, reports } = createMockContext({ ignoreContext: true })
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('context', 'when foo'))
      visitor.CallExpression(createCallExpression('context', 'when foo'))

      expect(reports.length).toBe(0)
    })

    test('should still check context blocks when ignoreContext is false', () => {
      const { context, reports } = createMockContext({ ignoreContext: false })
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('context', 'when foo'))
      visitor['CallExpression:exit'](createCallExpression('context', 'when foo'))
      visitor.CallExpression(createCallExpression('context', 'when foo'))
      visitor['CallExpression:exit'](createCallExpression('context', 'when foo'))

      expect(reports.length).toBe(1)
    })

    test('should still check it blocks when ignoreContext is true', () => {
      const { context, reports } = createMockContext({ ignoreContext: true })
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'dup'))
      visitor.CallExpression(createCallExpression('it', 'dup'))

      expect(reports.length).toBe(1)
    })

    test('should still check test blocks when ignoreContext is true', () => {
      const { context, reports } = createMockContext({ ignoreContext: true })
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('test', 'dup'))
      visitor.CallExpression(createCallExpression('test', 'dup'))

      expect(reports.length).toBe(1)
    })

    test('should not affect describe blocks when ignoreContext is true', () => {
      const { context, reports } = createMockContext({ ignoreContext: true })
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('suite'))
      visitor['CallExpression:exit'](createDescribeCall('suite'))
      visitor.CallExpression(createDescribeCall('suite'))
      visitor['CallExpression:exit'](createDescribeCall('suite'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'a'))
      const nodeNoLoc = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'a' }],
      }

      expect(() => visitor.CallExpression(nodeNoLoc)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'dup'))
      visitor.CallExpression(createCallExpression('it', 'dup'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.test.ts',
        getAST: () => null,
        getSource: () => 'it("test", () => {});',
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

      const visitor = noIdenticalTitleRule.create(context)

      expect(() => {
        visitor.CallExpression(createCallExpression('it', 'test'))
        visitor.CallExpression(createCallExpression('it', 'test'))
      }).not.toThrow()
    })

    test('should handle exit without matching enter', () => {
      const { context } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      expect(() => visitor['CallExpression:exit'](createDescribeCall('orphan'))).not.toThrow()
    })

    test('should handle CallExpression:exit for non-describe nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'test'))
      visitor['CallExpression:exit'](createCallExpression('it', 'test'))

      expect(reports.length).toBe(0)
    })
  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(noIdenticalTitleRule.meta.docs?.category).toBe('testing')
    })

    test('should have problem type', () => {
      expect(noIdenticalTitleRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noIdenticalTitleRule.meta.severity).toBe('warn')
    })

    test('should have description mentioning duplicate', () => {
      expect(noIdenticalTitleRule.meta.docs?.description).toContain('duplicate')
    })

    test('should have correct docs URL', () => {
      expect(noIdenticalTitleRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/no-identical-title')
    })

    test('should have recommended set to true', () => {
      expect(noIdenticalTitleRule.meta.docs?.recommended).toBe(true)
    })

    test('should have create function', () => {
      expect(typeof noIdenticalTitleRule.create).toBe('function')
    })

    test('should have meta defined', () => {
      expect(noIdenticalTitleRule.meta).toBeDefined()
    })
  })

  describe('suite function', () => {
    test('should detect duplicate suite titles in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('suite', 'MySuite'))
      visitor['CallExpression:exit'](createCallExpression('suite', 'MySuite'))
      visitor.CallExpression(createCallExpression('suite', 'MySuite'))
      visitor['CallExpression:exit'](createCallExpression('suite', 'MySuite'))

      expect(reports.length).toBe(1)
    })

    test('should not report unique suite titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('suite', 'suite A'))
      visitor['CallExpression:exit'](createCallExpression('suite', 'suite A'))
      visitor.CallExpression(createCallExpression('suite', 'suite B'))
      visitor['CallExpression:exit'](createCallExpression('suite', 'suite B'))

      expect(reports.length).toBe(0)
    })

    test('should allow same suite title in different scopes', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('suite', 'outer'))
      visitor.CallExpression(createCallExpression('suite', 'inner'))
      visitor['CallExpression:exit'](createCallExpression('suite', 'inner'))
      visitor['CallExpression:exit'](createCallExpression('suite', 'outer'))

      visitor.CallExpression(createCallExpression('suite', 'inner'))
      visitor['CallExpression:exit'](createCallExpression('suite', 'inner'))

      expect(reports.length).toBe(0)
    })
  })

  describe('fit xit xtest ftest variations', () => {
    test('should detect duplicate fit titles in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('fit', 'focused test'))
      visitor.CallExpression(createCallExpression('fit', 'focused test'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate xit titles in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('xit', 'skipped test'))
      visitor.CallExpression(createCallExpression('xit', 'skipped test'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate xtest titles in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('xtest', 'skipped'))
      visitor.CallExpression(createCallExpression('xtest', 'skipped'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate ftest titles in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('ftest', 'focused'))
      visitor.CallExpression(createCallExpression('ftest', 'focused'))

      expect(reports.length).toBe(1)
    })

    test('should not report unique fit titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('fit', 'first fit'))
      visitor.CallExpression(createCallExpression('fit', 'second fit'))

      expect(reports.length).toBe(0)
    })
  })

  describe('special title content', () => {
    test('should detect duplicate titles with unicode characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'テスト'))
      visitor.CallExpression(createCallExpression('it', 'テスト'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate titles with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'handles @#$%^&*()'))
      visitor.CallExpression(createCallExpression('it', 'handles @#$%^&*()'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate titles with emoji', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', '✅ works correctly'))
      visitor.CallExpression(createCallExpression('it', '✅ works correctly'))

      expect(reports.length).toBe(1)
    })

    test('should treat titles with different whitespace as different', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'should work'))
      visitor.CallExpression(createCallExpression('it', 'should  work'))

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate titles with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'test case 123'))
      visitor.CallExpression(createCallExpression('it', 'test case 123'))

      expect(reports.length).toBe(1)
    })

    test('should handle very long duplicate titles', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      const longTitle = 'a'.repeat(500)
      visitor.CallExpression(createCallExpression('it', longTitle))
      visitor.CallExpression(createCallExpression('it', longTitle))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected duplicate test title')
    })

    test('should not report when titles differ only in case', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'Should Work'))
      visitor.CallExpression(createCallExpression('it', 'should work'))

      expect(reports.length).toBe(0)
    })
  })

  describe('mixed function types', () => {
    test('should detect duplicate across describe and context with same title', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('shared title'))
      visitor['CallExpression:exit'](createDescribeCall('shared title'))
      visitor.CallExpression(createCallExpression('context', 'shared title'))
      visitor['CallExpression:exit'](createCallExpression('context', 'shared title'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate across describe and suite with same title', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createDescribeCall('group'))
      visitor['CallExpression:exit'](createDescribeCall('group'))
      visitor.CallExpression(createCallExpression('suite', 'group'))
      visitor['CallExpression:exit'](createCallExpression('suite', 'group'))

      expect(reports.length).toBe(1)
    })

    test('should report four duplicates of the same title', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'quad'))
      visitor.CallExpression(createCallExpression('it', 'quad'))
      visitor.CallExpression(createCallExpression('it', 'quad'))
      visitor.CallExpression(createCallExpression('it', 'quad'))

      expect(reports.length).toBe(3)
    })

    test('should detect duplicate in member expression describe.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createMemberCallExpression('describe', 'skip', 'skipped group'))
      visitor['CallExpression:exit'](createMemberCallExpression('describe', 'skip', 'skipped group'))
      visitor.CallExpression(createMemberCallExpression('describe', 'skip', 'skipped group'))
      visitor['CallExpression:exit'](createMemberCallExpression('describe', 'skip', 'skipped group'))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate across it and xit with same title', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression(createCallExpression('it', 'same'))
      visitor.CallExpression(createCallExpression('xit', 'same'))

      expect(reports.length).toBe(1)
    })
  })

  describe('suite() as describe function', () => {
    test('should track suite() for title scoping', () => {
      const { context, reports } = createMockContext({})
      const visitor = noIdenticalTitleRule.create(context)

      const suiteCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'suite' },
        arguments: [
          { type: 'Literal', value: 'outer' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(suiteCall)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test1' }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } },
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test1' }],
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 15 } },
      })
      visitor['CallExpression:exit'](suiteCall)

      expect(reports.length).toBe(1)
    })
  })

  describe('additional coverage', () => {
    test('should not report when title is a template literal without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'template test', cooked: 'template test' } }], expressions: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'template test', cooked: 'template test' } }], expressions: [] },
        ],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should not report when first argument is a number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is undefined literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when call has no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noIdenticalTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })
  })
})
})
