import { describe, test, expect, vi } from 'vitest'
import { noDynamicDeleteRule } from '../../../../src/rules/security/no-dynamic-delete.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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

function createDynamicDelete(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'dynamicKey' },
      computed: true,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createStaticDelete(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'staticKey' },
      computed: false,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteralKeyDelete(key: string, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Literal', value: key },
      computed: true,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createCallExpressionKeyDelete(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getKey' },
        arguments: [],
      },
      computed: true,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createMemberExpressionKeyDelete(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'config' },
        property: { type: 'Identifier', name: 'key' },
      },
      computed: true,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createTemplateLiteralDelete(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'prefix_' } }],
        expressions: [{ type: 'Identifier', name: 'dynamicPart' }],
      },
      computed: true,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createEmptyTemplateLiteralDelete(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'staticKey' } }],
        expressions: [],
      },
      computed: true,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createNonDeleteUnary(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    argument: { type: 'Identifier', name: 'value' },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-dynamic-delete rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noDynamicDeleteRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noDynamicDeleteRule.meta.severity).toBe('warn')
    })

    test('should not be recommended by default', () => {
      expect(noDynamicDeleteRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noDynamicDeleteRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noDynamicDeleteRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noDynamicDeleteRule.meta.docs?.description).toContain('dynamic property deletion')
    })

    test('should mention security in description', () => {
      expect(noDynamicDeleteRule.meta.docs?.description.toLowerCase()).toContain('security')
    })
  })

  describe('create', () => {
    test('should return visitor object with UnaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should report dynamic delete with identifier key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Dynamic property deletion')
    })

    test('should not report static delete (dot notation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createStaticDelete())

      expect(reports.length).toBe(0)
    })

    test('should not report delete with literal string key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createLiteralKeyDelete('staticKey'))

      expect(reports.length).toBe(0)
    })

    test('should report delete with call expression key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createCallExpressionKeyDelete())

      expect(reports.length).toBe(1)
    })

    test('should report delete with member expression key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createMemberExpressionKeyDelete())

      expect(reports.length).toBe(1)
    })

    test('should report delete with template literal with expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createTemplateLiteralDelete())

      expect(reports.length).toBe(1)
    })

    test('should not report delete with template literal without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createEmptyTemplateLiteralDelete())

      expect(reports.length).toBe(0)
    })

    test('should not report non-delete unary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createNonDeleteUnary())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('options', () => {
    test('should respect allowInTests option', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/src/test/file.test.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(0)
    })

    test('should still report in non-test files with allowInTests', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/file.ts')
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
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

      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(1)
    })
  })

  describe('test file detection', () => {
    test('should detect .test.ts files', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/src/utils/helper.test.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(0)
    })

    test('should detect .spec.ts files', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/src/utils/helper.spec.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(0)
    })

    test('should detect __tests__ directory', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/src/__tests__/helper.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(0)
    })

    test('should detect test/ directory', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/test/unit/helper.ts')
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(() => visitor.UnaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'key' },
          computed: true,
        },
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'variable' },
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          computed: true,
        },
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric literal key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 0 },
          computed: true,
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null literal key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: null },
          computed: true,
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should include actionable guidance', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports[0].message).toContain('Map.delete()')
    })

    test('should mention alternatives', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)

      visitor.UnaryExpression(createDynamicDelete())

      expect(reports[0].message).toContain('static property access')
    })
  })
})
