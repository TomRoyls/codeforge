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

  describe('meta expanded', () => {
    test('should have meta property defined', () => {
      expect(noDynamicDeleteRule.meta).toBeDefined()
    })

    test('should have docs property in meta', () => {
      expect(noDynamicDeleteRule.meta.docs).toBeDefined()
    })

    test('should have url in docs', () => {
      expect(noDynamicDeleteRule.meta.docs?.url).toBeDefined()
      expect(typeof noDynamicDeleteRule.meta.docs?.url).toBe('string')
    })

    test('should have url containing rule name', () => {
      expect(noDynamicDeleteRule.meta.docs?.url).toContain('no-dynamic-delete')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noDynamicDeleteRule.meta.schema)).toBe(true)
    })

    test('should have schema with at least one entry', () => {
      expect(noDynamicDeleteRule.meta.schema.length).toBeGreaterThanOrEqual(1)
    })

    test('should have schema with allowInTests property', () => {
      const schema = noDynamicDeleteRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('allowInTests')
    })

    test('should have allowInTests as boolean type in schema', () => {
      const schema = noDynamicDeleteRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, Record<string, unknown>>
      expect(properties.allowInTests.type).toBe('boolean')
    })

    test('should not be fixable', () => {
      const meta = noDynamicDeleteRule.meta as Record<string, unknown>
      expect(meta.fixable).toBeUndefined()
    })

    test('should have type as string', () => {
      expect(typeof noDynamicDeleteRule.meta.type).toBe('string')
    })
  })

  describe('create function', () => {
    test('should return object from create', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return UnaryExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('should extract options from context config', () => {
      const { context, reports } = createMockContext({ allowInTests: false })
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should handle create with no config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should handle create with null config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should create independent visitors per call', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext(
        { allowInTests: true },
        '/src/test/a.test.ts',
      )
      const v1 = noDynamicDeleteRule.create(ctx1)
      const v2 = noDynamicDeleteRule.create(ctx2)
      v1.UnaryExpression(createDynamicDelete())
      v2.UnaryExpression(createDynamicDelete())
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('dynamic delete detection with various identifiers', () => {
    test('should report delete obj[key]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[dynamicKey]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'data' },
          property: { type: 'Identifier', name: 'dynamicKey' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[index]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'index' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[i]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'i' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[userInput]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'userInput' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete data[fieldName]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'data' },
          property: { type: 'Identifier', name: 'fieldName' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete config[prop]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'prop' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete state[action]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'state' },
          property: { type: 'Identifier', name: 'action' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete result[key] with nested object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'ctx' },
            property: { type: 'Identifier', name: 'result' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'key' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete with computed true regardless of object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'prop' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[myVar] at different lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(10, 5))
      visitor.UnaryExpression(createDynamicDelete(20, 0))
      visitor.UnaryExpression(createDynamicDelete(100, 50))
      expect(reports.length).toBe(3)
    })
  })

  describe('NOT flagged: static delete (dot notation)', () => {
    test('should not report delete obj.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createStaticDelete())
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj.name with computed false', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'name' },
          computed: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj.id', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'id' },
          computed: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete config.value', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'value' },
          computed: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete state.loading', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'state' },
          property: { type: 'Identifier', name: 'loading' },
          computed: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete ctx.result', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'ctx' },
          property: { type: 'Identifier', name: 'result' },
          computed: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete data.items', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'data' },
          property: { type: 'Identifier', name: 'items' },
          computed: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete with computed explicitly false', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'anything' },
          computed: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete with computed undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete with computed null', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: null,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete with computed 0 (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: 0,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: non-delete operators', () => {
    test('should not report void operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report typeof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report ! operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createNonDeleteUnary())
      expect(reports.length).toBe(0)
    })

    test('should not report + operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: { type: 'Identifier', name: 'num' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Identifier', name: 'num' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report ~ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '~',
        argument: { type: 'Identifier', name: 'num' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report ++ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'i' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report -- operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UpdateExpression',
        operator: '--',
        argument: { type: 'Identifier', name: 'i' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report on empty operator string', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should only flag exactly "delete" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'Delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'key' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: non-MemberExpression argument', () => {
    test('should not report delete of identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'variable' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete of CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete of ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'ArrayExpression', elements: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete of ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'ObjectExpression', properties: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete of BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '+',
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete of Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete of ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete of FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete of ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: 'not-an-object',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('static property with string literal', () => {
    test('should not report delete obj["fixedKey"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createLiteralKeyDelete('fixedKey'))
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj["name"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createLiteralKeyDelete('name'))
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj[""]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createLiteralKeyDelete(''))
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj["long-property-name"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createLiteralKeyDelete('long-property-name'))
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj["with spaces"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createLiteralKeyDelete('with spaces'))
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj["with-dashes-and_underscores"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createLiteralKeyDelete('with-dashes-and_underscores'))
      expect(reports.length).toBe(0)
    })
  })

  describe('static property with number literal', () => {
    test('should not report delete arr[0]', () => {
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete arr[42]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 42 },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete arr[1]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 1 },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete arr[99]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 99 },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj[-1] with number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: -1 },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('static property with empty template literal', () => {
    test('should not report delete obj[`fixedKey`]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createEmptyTemplateLiteralDelete())
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj[``] with empty template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: '' } }],
            expressions: [],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj[`myProp`] with single quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'myProp' } }],
            expressions: [],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj[`long-name-here`] with complex static template', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'long-name-here' } }],
            expressions: [],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report delete obj[`kebab-case-key`] template with no expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'kebab-case-key' } }],
            expressions: [],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('dynamic property with template literal (has expressions)', () => {
    test('should report delete obj[`prefix_${name}`]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createTemplateLiteralDelete())
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[`hello_${world}`] with single expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: 'hello_' } },
              { type: 'TemplateElement', value: { raw: '' } },
            ],
            expressions: [{ type: 'Identifier', name: 'world' }],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[`${a}_${b}`] with two expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: '' } },
              { type: 'TemplateElement', value: { raw: '_' } },
              { type: 'TemplateElement', value: { raw: '' } },
            ],
            expressions: [
              { type: 'Identifier', name: 'a' },
              { type: 'Identifier', name: 'b' },
            ],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[`${dynamic}`] with only expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: '' } },
              { type: 'TemplateElement', value: { raw: '' } },
            ],
            expressions: [{ type: 'Identifier', name: 'dynamic' }],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[`a${b}c${d}e`] with multiple expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: 'a' } },
              { type: 'TemplateElement', value: { raw: 'c' } },
              { type: 'TemplateElement', value: { raw: 'e' } },
            ],
            expressions: [
              { type: 'Identifier', name: 'b' },
              { type: 'Identifier', name: 'd' },
            ],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('dynamic property with CallExpression', () => {
    test('should report delete obj[getKey()]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createCallExpressionKeyDelete())
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[getProp(x)]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getProp' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[String(x)]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'String' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[fn()] with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[obj2.getMethod()]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj2' },
              property: { type: 'Identifier', name: 'getMethod' },
              computed: false,
            },
            arguments: [],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('dynamic property with MemberExpression', () => {
    test('should report delete obj[other.prop]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createMemberExpressionKeyDelete())
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[config.key]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'config' },
            property: { type: 'Identifier', name: 'key' },
            computed: false,
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[state.fieldName]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'state' },
            property: { type: 'Identifier', name: 'fieldName' },
            computed: false,
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[data.columns[0]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'data' },
            property: { type: 'Literal', value: 0 },
            computed: true,
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete obj[props.name]', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'props' },
            property: { type: 'Identifier', name: 'name' },
            computed: false,
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('allowInTests option expanded', () => {
    test('should skip report when allowInTests=true and .test.ts file', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/my.test.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should skip report when allowInTests=true and .spec.ts file', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/my.spec.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should skip report when allowInTests=true and __tests__ path', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/src/__tests__/unit.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should skip report when allowInTests=true and test/ path', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/test/unit/helper.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should report when allowInTests=true but non-test file', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/utils.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should report when allowInTests=true and file has no test indicator', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/src/components/App.tsx',
      )
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should report when allowInTests=false and test file', () => {
      const { context, reports } = createMockContext({ allowInTests: false }, '/src/my.test.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should report when allowInTests=false and non-test file', () => {
      const { context, reports } = createMockContext({ allowInTests: false }, '/src/file.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should report when allowInTests is undefined and test file', () => {
      const { context, reports } = createMockContext({}, '/src/my.test.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should skip when allowInTests is string "true" (truthy)', () => {
      const { context, reports } = createMockContext({ allowInTests: 'true' }, '/src/my.test.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should skip when allowInTests is 1 (truthy number)', () => {
      const { context, reports } = createMockContext({ allowInTests: 1 }, '/src/my.test.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })
  })

  describe('isTestContext patterns', () => {
    test('should detect .test.ts extension', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/app.test.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should detect .test.js extension', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/app.test.js')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should detect .spec.ts extension', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/app.spec.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should detect .spec.js extension', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/app.spec.js')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should detect __tests__ in path', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/src/__tests__/app.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should detect test/ in path', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/test/integration/app.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should not detect .testing.ts as test file', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/app.testing.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should not detect test in filename without separators', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/src/testing-utils.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should not detect regular .ts as test file', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/index.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should not detect .tsx as test file', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/App.tsx')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })
  })

  describe('violation properties', () => {
    test('report should have message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports[0]).toHaveProperty('message')
    })

    test('message should be a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(typeof reports[0].message).toBe('string')
    })

    test('message should contain "Dynamic property deletion"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports[0].message).toContain('Dynamic property deletion')
    })

    test('message should contain "detected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports[0].message).toContain('detected')
    })

    test('message should contain "security"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports[0].message.toLowerCase()).toContain('security')
    })

    test('report should have loc with start', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(3, 5))
      expect(reports[0].loc?.start).toBeDefined()
    })

    test('report should have loc with end', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(3, 5))
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(7, 12))
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(7, 12))
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report should preserve exact location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(15, 8))
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(28)
    })
  })

  describe('extractLocation edge cases', () => {
    test('should return default location for null node', () => {
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
        loc: null,
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should return default location for node without loc', () => {
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
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle partial loc with only start', () => {
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
        loc: { start: { line: 5, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with string line', () => {
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
        loc: { start: { line: '5', column: 10 }, end: { line: 5, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with string column', () => {
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
        loc: { start: { line: 5, column: '10' }, end: { line: 5, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with missing start properties', () => {
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
        loc: { start: {}, end: {} },
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report two violations separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(1, 0))
      visitor.UnaryExpression(createDynamicDelete(2, 0))
      expect(reports.length).toBe(2)
    })

    test('should report three violations separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(1, 0))
      visitor.UnaryExpression(createDynamicDelete(2, 0))
      visitor.UnaryExpression(createDynamicDelete(3, 0))
      expect(reports.length).toBe(3)
    })

    test('should report many violations separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.UnaryExpression(createDynamicDelete(i + 1, 0))
      }
      expect(reports.length).toBe(10)
    })

    test('should preserve location for each violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete(5, 10))
      visitor.UnaryExpression(createDynamicDelete(10, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should only report dynamic deletes among mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      visitor.UnaryExpression(createStaticDelete())
      visitor.UnaryExpression(createDynamicDelete(2, 0))
      visitor.UnaryExpression(createNonDeleteUnary())
      expect(reports.length).toBe(2)
    })

    test('should mix dynamic and static deletes correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createStaticDelete())
      visitor.UnaryExpression(createStaticDelete())
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases expanded', () => {
    test('should handle node with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: 'not-an-object',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = { type: 'UnaryExpression' }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean literal value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: true },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined literal value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: undefined },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with regex literal value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: /test/ },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with object literal value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: { key: 'val' } },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle MemberExpression with computed true and missing property', () => {
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with NaN literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: NaN },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with Infinity literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: Infinity },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with array as argument (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: [1, 2, 3],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle false as entire node', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      expect(() => visitor.UnaryExpression(false)).not.toThrow()
    })

    test('should handle 0 as entire node', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      expect(() => visitor.UnaryExpression(0)).not.toThrow()
    })

    test('should handle empty string as entire node', () => {
      const { context } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      expect(() => visitor.UnaryExpression('')).not.toThrow()
    })

    test('should handle node with Symbol operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: Symbol('delete'),
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'key' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle template literal with undefined expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'key' } }],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('isStaticProperty edge cases', () => {
    test('should not report delete with boolean literal key (not string/number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: true },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report delete with Literal string key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'prop' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report delete with SequenceExpression key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'SequenceExpression',
            expressions: [
              { type: 'Literal', value: 1 },
              { type: 'Identifier', name: 'a' },
            ],
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report delete with LogicalExpression key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: {
            type: 'LogicalExpression',
            operator: '||',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Literal', value: 'fallback' },
          },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle null property on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: null,
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle undefined property on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: undefined,
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('file path variations', () => {
    test('should handle windows-style paths for test files', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        'C:\\project\\test\\unit\\file.test.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested test paths', () => {
      const { context, reports } = createMockContext(
        { allowInTests: true },
        '/home/user/project/src/a/b/c/d.test.ts',
      )
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should handle relative test paths', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, './test/unit/file.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should not match test in middle of filename', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '/src/testable.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should match test/ at start of path', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, 'test/foo.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })

    test('should handle empty file path', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(1)
    })

    test('should handle file path with only extension', () => {
      const { context, reports } = createMockContext({ allowInTests: true }, '.test.ts')
      const visitor = noDynamicDeleteRule.create(context)
      visitor.UnaryExpression(createDynamicDelete())
      expect(reports.length).toBe(0)
    })
  })
})
