import { describe, test, expect, vi } from 'vitest'
import { preferEnumInitializersRule } from '../../../../src/rules/patterns/prefer-enum-initializers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'enum Status { Active = 1 };',
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

function createEnumMember(name: string, initializer: unknown, line = 1, column = 0): unknown {
  return {
    type: 'TSEnumMember',
    id: {
      type: 'Identifier',
      name,
    },
    initializer,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createEnumMemberWithStringId(
  value: string,
  initializer: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'TSEnumMember',
    id: {
      type: 'Literal',
      value,
    },
    initializer,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('prefer-enum-initializers rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferEnumInitializersRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferEnumInitializersRule.meta.severity).toBe('warn')
    })

    test('should not be recommended by default', () => {
      expect(preferEnumInitializersRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(preferEnumInitializersRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferEnumInitializersRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferEnumInitializersRule.meta.fixable).toBeUndefined()
    })

    test('should mention explicit value in description', () => {
      expect(preferEnumInitializersRule.meta.docs?.description.toLowerCase()).toContain('explicit')
    })

    test('should mention enum in description', () => {
      expect(preferEnumInitializersRule.meta.docs?.description.toLowerCase()).toContain('enum')
    })

    test('should mention value in description', () => {
      expect(preferEnumInitializersRule.meta.docs?.description.toLowerCase()).toContain('value')
    })
  })

  describe('create', () => {
    test('should return visitor object with TSEnumMember method', () => {
      const { context } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      expect(visitor).toHaveProperty('TSEnumMember')
    })

    test('should return visitor with function for TSEnumMember', () => {
      const { context } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      expect(typeof visitor.TSEnumMember).toBe('function')
    })
  })

  describe('enum members with initializers - should not report', () => {
    test('should not report enum member with string literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('Active', createLiteral('active')))

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with number literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('Status', createLiteral(1)))

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with zero literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('None', createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with negative number initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('Negative', createLiteral(-1)))

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with boolean literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('Flag', createLiteral(true)))

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with null literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('Empty', createLiteral(null)))

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with object expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Complex', {
          type: 'ObjectExpression',
          properties: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with array expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Items', {
          type: 'ArrayExpression',
          elements: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with binary expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Computed', {
          type: 'BinaryExpression',
          left: createLiteral(1),
          operator: '+',
          right: createLiteral(2),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with identifier initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Ref', {
          type: 'Identifier',
          name: 'someValue',
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with call expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Func', {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getValue' },
          arguments: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with template literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Template', {
          type: 'TemplateLiteral',
          quasis: [{ value: 'prefix' }],
          expressions: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with member expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Member', {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Constants' },
          property: { type: 'Identifier', name: 'VALUE' },
          computed: false,
        }),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('enum members without initializers - should report', () => {
    test('should report enum member without initializer property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'AutoIncrement',
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AutoIncrement')
      expect(reports[0].message).toContain('explicit value')
    })

    test('should report enum member with undefined initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'UndefinedInit',
        },
        initializer: undefined,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('UndefinedInit')
    })

    test('should report enum member with null initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'NullInit',
        },
        initializer: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('NullInit')
    })

    test('should report first member without initializer in enum', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'First' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('First')
    })

    test('should report middle member without initializer in enum', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Middle' },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 12 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Middle')
    })

    test('should report last member without initializer in enum', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Last' },
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 10 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Last')
    })
  })

  describe('string literal member id', () => {
    test('should report string literal member id without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMemberWithStringId('computed-key', undefined))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('computed-key')
    })

    test('should not report string literal member id with initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMemberWithStringId('computed-key', createLiteral(1)))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include member name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'MyStatus' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports[0].message).toContain('MyStatus')
    })

    test('should mention explicit value in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Test' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports[0].message.toLowerCase()).toContain('explicit')
    })

    test('should mention should have in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Test' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports[0].message.toLowerCase()).toContain('should have')
    })
  })

  describe('location reporting', () => {
    test('should report correct line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Test' },
        loc: { start: { line: 10, column: 2 }, end: { line: 10, column: 12 } },
      })

      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report correct column number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Test' },
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 15 } },
      })

      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should include end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Test' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(20)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      expect(() => visitor.TSEnumMember(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      expect(() => visitor.TSEnumMember(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      expect(() => visitor.TSEnumMember('string')).not.toThrow()
      expect(reports.length).toBe(0)
      expect(() => visitor.TSEnumMember(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      const node = {
        type: 'TSEnumMember',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'Test',
        },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'Test',
        },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle id without type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          name: 'Test',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle id with non-Identifier and non-Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          type: 'SomeOtherType',
          name: 'Test',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle empty object as id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle id without name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Test' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

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
        getSource: () => 'enum E { A };',
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

      const visitor = preferEnumInitializersRule.create(context)

      expect(() =>
        visitor.TSEnumMember({
          type: 'TSEnumMember',
          id: { type: 'Identifier', name: 'Test' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle multiple enum members with mixed states', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      // Valid - has initializer
      visitor.TSEnumMember(createEnumMember('Valid', createLiteral(1)))
      // Invalid - no initializer
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Invalid' },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 15 } },
      })
      // Valid - has initializer
      visitor.TSEnumMember(createEnumMember('AlsoValid', createLiteral(2)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid')
    })

    test('should handle empty string literal id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMemberWithStringId('', undefined))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Enum member ''")
    })

    test('should handle numeric literal id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: {
          type: 'Literal',
          value: 123,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle boolean literal id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: {
          type: 'Literal',
          value: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })
  })

  describe('real-world enum scenarios', () => {
    test('should handle status enum with all initializers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('Pending', createLiteral(1)))
      visitor.TSEnumMember(createEnumMember('Active', createLiteral(2)))
      visitor.TSEnumMember(createEnumMember('Completed', createLiteral(3)))

      expect(reports.length).toBe(0)
    })

    test('should report status enum with missing initializers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Pending' },
        loc: { start: { line: 1, column: 2 }, end: { line: 1, column: 15 } },
      })
      visitor.TSEnumMember(createEnumMember('Active', createLiteral(2)))
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Completed' },
        loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 18 } },
      })

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Pending')
      expect(reports[1].message).toContain('Completed')
    })

    test('should handle string enum with all initializers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('Error', createLiteral('error')))
      visitor.TSEnumMember(createEnumMember('Warn', createLiteral('warn')))
      visitor.TSEnumMember(createEnumMember('Info', createLiteral('info')))

      expect(reports.length).toBe(0)
    })

    test('should handle heterogeneous enum with all initializers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember(createEnumMember('Start', createLiteral(0)))
      visitor.TSEnumMember(createEnumMember('Label', createLiteral('custom')))
      visitor.TSEnumMember(createEnumMember('End', createLiteral(100)))

      expect(reports.length).toBe(0)
    })
  })
})
