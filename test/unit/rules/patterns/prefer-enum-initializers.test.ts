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

  describe('meta - comprehensive', () => {
    test('should have meta defined', () => {
      expect(preferEnumInitializersRule.meta).toBeDefined()
    })

    test('should have meta type as string', () => {
      expect(typeof preferEnumInitializersRule.meta.type).toBe('string')
    })

    test('should have meta severity as string', () => {
      expect(typeof preferEnumInitializersRule.meta.severity).toBe('string')
    })

    test('should have docs object defined', () => {
      expect(preferEnumInitializersRule.meta.docs).toBeDefined()
    })

    test('should have docs description as non-empty string', () => {
      expect(typeof preferEnumInitializersRule.meta.docs?.description).toBe('string')
      expect(preferEnumInitializersRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should have docs url defined', () => {
      expect(preferEnumInitializersRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as string', () => {
      expect(typeof preferEnumInitializersRule.meta.docs?.url).toBe('string')
    })

    test('should mention predictable in description', () => {
      expect(preferEnumInitializersRule.meta.docs?.description.toLowerCase()).toContain(
        'predictable',
      )
    })

    test('should mention prevent in description', () => {
      expect(preferEnumInitializersRule.meta.docs?.description.toLowerCase()).toContain('prevent')
    })

    test('should have schema as empty array', () => {
      expect(preferEnumInitializersRule.meta.schema).toEqual([])
    })

    test('should have meta type exactly suggestion', () => {
      expect(preferEnumInitializersRule.meta.type).toBe('suggestion')
    })

    test('should have meta severity exactly warn', () => {
      expect(preferEnumInitializersRule.meta.severity).toBe('warn')
    })
  })

  describe('create - comprehensive', () => {
    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return new visitor object each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferEnumInitializersRule.create(context)
      const visitor2 = preferEnumInitializersRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with different file paths', () => {
      const { context, reports } = createMockContext({}, '/different/path.ts')
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Test' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should accept context with different source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'enum Color { Red }')
      const visitor = preferEnumInitializersRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Red' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should have exactly one method in visitor', () => {
      const { context } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('should have TSEnumMember as the only method name', () => {
      const { context } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      expect(Object.keys(visitor)).toEqual(['TSEnumMember'])
    })
  })

  describe('detection - falsy initializer values', () => {
    test('should report when initializer is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Empty', ''))
      expect(reports.length).toBe(1)
    })

    test('should report when initializer is zero', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Zero', 0))
      expect(reports.length).toBe(1)
    })

    test('should report when initializer is false', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Falsy', false))
      expect(reports.length).toBe(1)
    })

    test('should report when initializer is NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Nan', NaN))
      expect(reports.length).toBe(1)
    })

    test('should not report when initializer is empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Obj', {}))
      expect(reports.length).toBe(0)
    })

    test('should not report when initializer is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Arr', []))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection - various member names', () => {
    test('should report single-char member name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('A', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('A')
    })

    test('should report PascalCase member name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('MyEnumValue', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('MyEnumValue')
    })

    test('should report SCREAMING_SNAKE_CASE member name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('MY_ENUM_VALUE', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('MY_ENUM_VALUE')
    })

    test('should report member name with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Value123', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Value123')
    })

    test('should report long member name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('VeryLongDescriptiveEnumMemberName', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('VeryLongDescriptiveEnumMemberName')
    })

    test('should report underscore prefixed member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('_private', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('should report dollar prefixed member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('$jquery', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })

    test('should report string literal id with special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMemberWithStringId('key-with-dashes', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('key-with-dashes')
    })

    test('should report string literal id with spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMemberWithStringId('key with spaces', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('key with spaces')
    })

    test('should report string literal id with unicode', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMemberWithStringId('Ключ', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Ключ')
    })
  })

  describe('detection - node structure variations', () => {
    test('should report node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        id: { type: 'Identifier', name: 'NoType' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Extra' },
        extra: 'data',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report computed property without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Literal', value: 'computed' },
        computed: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should not report computed property with initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Literal', value: 'computed' },
        computed: true,
        initializer: createLiteral(1),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should report node with decorator property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Decorated' },
        decorators: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Ranged' },
        range: [0, 10],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report node with trailing comma', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Trailing' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report node with both type and initializer as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'BothUndef' },
        initializer: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting - comprehensive initializers', () => {
    test('should not report with conditional expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Cond', {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: createLiteral(1),
          alternate: createLiteral(2),
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with unary expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Neg', {
          type: 'UnaryExpression',
          operator: '-',
          argument: createLiteral(1),
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with arrow function initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Fn', {
          type: 'ArrowFunctionExpression',
          params: [],
          body: createLiteral(1),
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with type assertion initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Typed', {
          type: 'TSAsExpression',
          expression: createLiteral(1),
          typeAnnotation: { type: 'TSNumberKeyword' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with spread element initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Spread', {
          type: 'SpreadElement',
          argument: { type: 'Identifier', name: 'arr' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with logical expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Logic', {
          type: 'LogicalExpression',
          left: createLiteral(1),
          operator: '||',
          right: createLiteral(2),
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with sequence expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Seq', {
          type: 'SequenceExpression',
          expressions: [createLiteral(1), createLiteral(2)],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with new expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('NewObj', {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'MyClass' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with assignment expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Assign', {
          type: 'AssignmentExpression',
          left: { type: 'Identifier', name: 'x' },
          operator: '=',
          right: createLiteral(1),
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with update expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Inc', {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'x' },
          prefix: false,
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with tagged template expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Tagged', {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with yield expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(
        createEnumMember('Yield', {
          type: 'YieldExpression',
          argument: createLiteral(1),
        }),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - additional', () => {
    test('should handle node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({ type: 'TSEnumMember' })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node with numeric id value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node with boolean id value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Literal', value: true },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node with null id value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Literal', value: null },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node with object id value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Literal', value: { nested: true } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node with id as array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: [1, 2, 3],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node with id as number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node with id as string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: 'string-id',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node with id as null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle repeated calls to same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.TSEnumMember(createEnumMember(`Member${i}`, undefined))
      }

      expect(reports.length).toBe(5)
    })

    test('should handle very long member name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      const longName = 'A'.repeat(200)
      visitor.TSEnumMember(createEnumMember(longName, undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should handle member name with unicode', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('日本語メンバー', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('日本語メンバー')
    })
  })

  describe('location - comprehensive', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined, 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined, 999, 5))
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined, 1, 80))
      expect(reports[0].loc?.start.column).toBe(80)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined, 3, 4))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('should report default location when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'NoLoc' },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location from node without end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Partial' },
        loc: { start: { line: 5, column: 3 } },
      })
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location with zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Zero', undefined, 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve location for multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('First', undefined, 1, 0))
      visitor.TSEnumMember(createEnumMember('Second', undefined, 2, 4))
      visitor.TSEnumMember(createEnumMember('Third', undefined, 3, 8))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should report location for string literal id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMemberWithStringId('key', undefined, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at line 100 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined, 100, 0))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1 column 100', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined, 1, 100))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report location for node with multiline span', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: { type: 'Identifier', name: 'Multi' },
        loc: { start: { line: 5, column: 2 }, end: { line: 7, column: 10 } },
      })
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(7)
    })
  })

  describe('messages - comprehensive', () => {
    test('should format message with single quotes around name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Status', undefined))
      expect(reports[0].message).toContain("'Status'")
    })

    test('should start message with Enum member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Status', undefined))
      expect(reports[0].message).toMatch(/^Enum member/)
    })

    test('should end message with period', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Status', undefined))
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should contain explicit value phrase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined))
      expect(reports[0].message).toContain('explicit value')
    })

    test('should contain should have phrase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined))
      expect(reports[0].message).toContain('should have')
    })

    test('should include unknown for missing id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember({
        type: 'TSEnumMember',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports[0].message).toContain("'unknown'")
    })

    test('should produce consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('MyMember', undefined))
      expect(reports[0].message).toBe("Enum member 'MyMember' should have an explicit value.")
    })
  })

  describe('multiple reports', () => {
    test('should report all members without initializers in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('A', undefined))
      visitor.TSEnumMember(createEnumMember('B', undefined))
      visitor.TSEnumMember(createEnumMember('C', undefined))
      expect(reports.length).toBe(3)
    })

    test('should report each member with correct name in batch', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Alpha', undefined))
      visitor.TSEnumMember(createEnumMember('Beta', undefined))
      expect(reports[0].message).toContain('Alpha')
      expect(reports[1].message).toContain('Beta')
    })

    test('should report only members without initializers when mixed', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Has1', createLiteral(1)))
      visitor.TSEnumMember(createEnumMember('Missing1', undefined))
      visitor.TSEnumMember(createEnumMember('Has2', createLiteral(2)))
      visitor.TSEnumMember(createEnumMember('Missing2', undefined))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Missing1')
      expect(reports[1].message).toContain('Missing2')
    })

    test('should handle large number of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.TSEnumMember(createEnumMember(`Member${i}`, undefined))
      }
      expect(reports.length).toBe(50)
    })

    test('should handle all members with initializers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.TSEnumMember(createEnumMember(`Member${i}`, createLiteral(i)))
      }
      expect(reports.length).toBe(0)
    })

    test('should handle alternating valid and invalid members', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          visitor.TSEnumMember(createEnumMember(`Valid${i}`, createLiteral(i)))
        } else {
          visitor.TSEnumMember(createEnumMember(`Invalid${i}`, undefined))
        }
      }
      expect(reports.length).toBe(5)
    })

    test('should preserve order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('First', undefined, 1, 0))
      visitor.TSEnumMember(createEnumMember('Second', undefined, 2, 0))
      visitor.TSEnumMember(createEnumMember('Third', undefined, 3, 0))
      expect(reports[0].message).toContain('First')
      expect(reports[1].message).toContain('Second')
      expect(reports[2].message).toContain('Third')
    })

    test('should report single member in singleton enum', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Only', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Only')
    })

    test('should report each member independently with different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('A', undefined, 1, 2))
      visitor.TSEnumMember(createEnumMember('B', undefined, 3, 4))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[1].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.column).toBe(4)
    })
  })

  describe('context variations', () => {
    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'enum E { A };',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('A', undefined))
      expect(reports.length).toBe(1)
    })

    test('should work with config with extra options', () => {
      const { context, reports } = createMockContext({ extraOption: true, anotherOption: 'value' })
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined))
      expect(reports.length).toBe(1)
    })

    test('should work with minimal context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/',
      } as unknown as RuleContext

      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('A', undefined))
      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined))
      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockContext(
        {},
        '/very/deeply/nested/path/to/src/enums/status.ts',
      )
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined))
      expect(reports.length).toBe(1)
    })

    test('should work with Windows-style file path', () => {
      const { context, reports } = createMockContext({}, 'C:\\project\\src\\file.ts')
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined))
      expect(reports.length).toBe(1)
    })

    test('should work with config containing null options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Test', undefined))
      expect(reports.length).toBe(1)
    })

    test('should work when report is called multiple times for same context', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('A', undefined))
      visitor.TSEnumMember(createEnumMember('B', undefined))
      expect(reports.length).toBe(2)
    })

    test('should handle source with actual enum code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/status.ts',
        'enum Status { Active = 1, Inactive = 0, Pending }',
      )
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Pending', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Pending')
    })
  })

  describe('individual member name tests', () => {
    test('should report member "A" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('A', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('A')
    })

    test('should report member "Z" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Z', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Z')
    })

    test('should report member "Alpha" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Alpha', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Alpha')
    })

    test('should report member "Beta" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Beta', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Beta')
    })

    test('should report member "Gamma" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Gamma', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Gamma')
    })

    test('should report member "Status" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Status', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Status')
    })

    test('should report member "Active" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Active', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Active')
    })

    test('should report member "COMPLETE" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('COMPLETE', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('COMPLETE')
    })

    test('should report member "under_score" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('under_score', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('under_score')
    })

    test('should report member "PascalCase" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('PascalCase', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('PascalCase')
    })

    test('should report member "camelCase" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('camelCase', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('camelCase')
    })

    test('should report member "UPPER_CASE" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('UPPER_CASE', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('UPPER_CASE')
    })

    test('should report member "Mixed_Case_123" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Mixed_Case_123', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Mixed_Case_123')
    })

    test('should report member "_leading" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('_leading', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_leading')
    })

    test('should report member "trailing_" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('trailing_', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('trailing_')
    })

    test('should report member "$dollar" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('$dollar', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$dollar')
    })

    test('should report member "WithNumbers1" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('WithNumbers1', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('WithNumbers1')
    })

    test('should report member "VeryLongNameThatGoesOnAndOn" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('VeryLongNameThatGoesOnAndOn', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('VeryLongNameThatGoesOnAndOn')
    })

    test('should report member "x" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('x', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report member "OK" without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('OK', undefined))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OK')
    })
  })

  describe('individual initializer type tests', () => {
    test('should not report with string literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', createLiteral('value')))
      expect(reports.length).toBe(0)
    })

    test('should not report with number literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', createLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('should not report with negative number initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', createLiteral(-1)))
      expect(reports.length).toBe(0)
    })

    test('should not report with boolean true initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', createLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('should not report with boolean false initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', createLiteral(false)))
      expect(reports.length).toBe(0)
    })

    test('should not report with null literal initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', createLiteral(null)))
      expect(reports.length).toBe(0)
    })

    test('should not report with object expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', { type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('should not report with array expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', { type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('should not report with binary expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', { type: 'BinaryExpression' }))
      expect(reports.length).toBe(0)
    })

    test('should not report with call expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', { type: 'CallExpression' }))
      expect(reports.length).toBe(0)
    })

    test('should not report with arrow function initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', { type: 'ArrowFunctionExpression' }))
      expect(reports.length).toBe(0)
    })

    test('should not report with member expression initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Member', { type: 'MemberExpression' }))
      expect(reports.length).toBe(0)
    })
  })

  describe('individual location tests', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 1, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1 column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 1, 5))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 2 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 2, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 3 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 3, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 10 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 10, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 10 column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 10, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at line 50 column 4', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 50, 4))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location at line 100 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 100, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 100, 50))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 1 column 100', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 1, 100))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report location at line 255 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 255, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(255)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 999 column 12', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEnumInitializersRule.create(context)
      visitor.TSEnumMember(createEnumMember('Loc', undefined, 999, 12))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(12)
    })
  })
})
