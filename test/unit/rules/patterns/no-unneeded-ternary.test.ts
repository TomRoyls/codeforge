import { describe, test, expect, vi } from 'vitest'
import { noUnneededTernaryRule } from '../../../../src/rules/patterns/no-unneeded-ternary.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = cond ? true : false;',
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

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createNumericLiteral(value: number, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? String(value),
  }
}

function createStringLiteral(value: string, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? `"${value}"`,
  }
}

describe('no-unneeded-ternary rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnneededTernaryRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUnneededTernaryRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnneededTernaryRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnneededTernaryRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnneededTernaryRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnneededTernaryRule.meta.fixable).toBeUndefined()
    })

    test('should mention ternary in description', () => {
      expect(noUnneededTernaryRule.meta.docs?.description.toLowerCase()).toContain('ternary')
    })

    test('should mention simplified in description', () => {
      expect(noUnneededTernaryRule.meta.docs?.description.toLowerCase()).toContain('simplified')
    })
  })

  describe('create', () => {
    test('should return visitor object with ConditionalExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(visitor).toHaveProperty('ConditionalExpression')
    })
  })

  describe('detecting cond ? true : false pattern', () => {
    test('should report when consequent is true and alternate is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include !! in message for true : false pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!!')
    })

    test('should include Boolean() in message for true : false pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('Boolean(')
    })
  })

  describe('detecting cond ? false : true pattern', () => {
    test('should report when consequent is false and alternate is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include ! in message for false : true pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!condition')
    })
  })

  describe('detecting identical branches pattern', () => {
    test('should report when consequent and alternate are identical literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when consequent and alternate are identical identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('value'),
        createIdentifier('value'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when consequent and alternate are identical string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('hello'),
        createStringLiteral('hello'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should mention identical in message for identical branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('identical')
    })
  })

  describe('allowing valid ternary expressions', () => {
    test('should not report when consequent and alternate are different values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(1),
        createNumericLiteral(2),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is true and alternate is not false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createNumericLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is not true and alternate is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(1),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent and alternate are different identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('a'),
        createIdentifier('b'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report complex ternary with different branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        {
          type: 'BinaryExpression',
          operator: '>',
          left: createIdentifier('x'),
          right: createNumericLiteral(0),
        },
        createStringLiteral('positive'),
        createStringLiteral('non-positive'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression('string')).not.toThrow()
      expect(() => visitor.ConditionalExpression(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'CallExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle missing consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        alternate: createBooleanLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle missing alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        null,
        createBooleanLiteral(false),
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        null,
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'Literal' },
        { type: 'Literal', value: false },
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle nodes with raw property for comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'TemplateLiteral', raw: '`hello`' },
        { type: 'TemplateLiteral', raw: '`hello`' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle different raw values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'TemplateLiteral', raw: '`hello`' },
        { type: 'TemplateLiteral', raw: '`world`' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined raw in one node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'TemplateLiteral' },
        { type: 'TemplateLiteral', raw: '`hello`' },
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should include location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('multiple patterns', () => {
    test('should only report once for cond ? true : false (not also as identical)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report multiple different ternary violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('cond1'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      const node2 = createConditionalExpression(
        createIdentifier('cond2'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node1)
      visitor.ConditionalExpression(node2)

      expect(reports.length).toBe(2)
    })
  })

  describe('message quality', () => {
    test('should mention boolean literals in message for true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('should mention unnecessary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should mention ternary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })
  })
})
