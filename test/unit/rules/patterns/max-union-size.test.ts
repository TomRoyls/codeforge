import { describe, test, expect, vi } from 'vitest'
import { maxUnionSizeRule } from '../../../../src/rules/patterns/max-union-size.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createUnionType(typeCount: number, line = 1, column = 0): unknown {
  const types = []
  for (let i = 0; i < typeCount; i++) {
    types.push({
      type: 'TSTypeReference',
      typeName: {
        type: 'Identifier',
        name: `Type${i}`,
      },
    })
  }

  return {
    type: 'TSUnionType',
    types,
    loc: {
      start: { line, column },
      end: { line, column: column + 50 },
    },
  }
}

function createNonUnionType(line = 1, column = 0): unknown {
  return {
    type: 'TSTypeReference',
    typeName: {
      type: 'Identifier',
      name: 'SomeType',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('max-union-size rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(maxUnionSizeRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(maxUnionSizeRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(maxUnionSizeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(maxUnionSizeRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(maxUnionSizeRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(maxUnionSizeRule.meta.fixable).toBeUndefined()
    })

    test('should mention union in description', () => {
      expect(maxUnionSizeRule.meta.docs?.description.toLowerCase()).toContain('union')
    })

    test('should have docs property', () => {
      expect(maxUnionSizeRule.meta.docs).toBeDefined()
    })

    test('should have description as a string', () => {
      expect(typeof maxUnionSizeRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(maxUnionSizeRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention type design in description', () => {
      expect(maxUnionSizeRule.meta.docs?.description.toLowerCase()).toContain('type')
    })

    test('should have severity as a string', () => {
      expect(typeof maxUnionSizeRule.meta.severity).toBe('string')
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(maxUnionSizeRule.meta.type)
    })

    test('should have docs.url as a string', () => {
      expect(typeof maxUnionSizeRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url containing codeforge', () => {
      expect(maxUnionSizeRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(maxUnionSizeRule.meta.schema)).toBe(true)
    })

    test('should have schema with one entry', () => {
      expect(maxUnionSizeRule.meta.schema).toHaveLength(1)
    })

    test('should have schema[0] as an object', () => {
      const schema = maxUnionSizeRule.meta.schema
      if (Array.isArray(schema)) {
        expect(typeof schema[0]).toBe('object')
      }
    })

    test('should have schema with max property definition', () => {
      const schema = maxUnionSizeRule.meta.schema
      if (Array.isArray(schema) && schema[0] && typeof schema[0] === 'object') {
        const s = schema[0] as Record<string, unknown>
        const props = s.properties as Record<string, unknown> | undefined
        expect(props).toBeDefined()
        expect(props?.max).toBeDefined()
      }
    })

    test('should have schema max as number type', () => {
      const schema = maxUnionSizeRule.meta.schema
      if (Array.isArray(schema) && schema[0] && typeof schema[0] === 'object') {
        const s = schema[0] as Record<string, unknown>
        const props = s.properties as Record<string, unknown>
        const maxProp = props.max as Record<string, unknown>
        expect(maxProp.type).toBe('number')
      }
    })

    test('should have schema max with minimum of 1', () => {
      const schema = maxUnionSizeRule.meta.schema
      if (Array.isArray(schema) && schema[0] && typeof schema[0] === 'object') {
        const s = schema[0] as Record<string, unknown>
        const props = s.properties as Record<string, unknown>
        const maxProp = props.max as Record<string, unknown>
        expect(maxProp.minimum).toBe(1)
      }
    })

    test('should have schema max with default of 5', () => {
      const schema = maxUnionSizeRule.meta.schema
      if (Array.isArray(schema) && schema[0] && typeof schema[0] === 'object') {
        const s = schema[0] as Record<string, unknown>
        const props = s.properties as Record<string, unknown>
        const maxProp = props.max as Record<string, unknown>
        expect(maxProp.default).toBe(5)
      }
    })

    test('should have schema with additionalProperties false', () => {
      const schema = maxUnionSizeRule.meta.schema
      if (Array.isArray(schema) && schema[0] && typeof schema[0] === 'object') {
        const s = schema[0] as Record<string, unknown>
        expect(s.additionalProperties).toBe(false)
      }
    })

    test('should not be deprecated', () => {
      expect(maxUnionSizeRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(maxUnionSizeRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(maxUnionSizeRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have category exactly equal to patterns', () => {
      expect(maxUnionSizeRule.meta.docs?.category).toBe('patterns')
    })

    test('should have recommended as boolean true', () => {
      expect(maxUnionSizeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have description that mentions large unions', () => {
      const desc = maxUnionSizeRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('large')
    })

    test('should have meta property on rule', () => {
      expect(maxUnionSizeRule).toHaveProperty('meta')
    })

    test('should have create property on rule', () => {
      expect(maxUnionSizeRule).toHaveProperty('create')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(visitor).toHaveProperty('TSUnionType')
    })

    test('should return an object', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with TSUnionType as a function', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(typeof visitor.TSUnionType).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext()
      const visitor1 = maxUnionSizeRule.create(context)
      const visitor2 = maxUnionSizeRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should not throw when creating visitor with valid context', () => {
      const { context } = createMockRuleContext()

      expect(() => maxUnionSizeRule.create(context)).not.toThrow()
    })

    test('should work with empty source string', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
    })

    test('should work with various file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/types.ts' })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'type X = A | B;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
    })

    test('should work with source containing union types', () => {
      const source =
        'type Status = "active" | "inactive" | "pending" | "archived" | "deleted" | "review";'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
    })

    test('create is a function on rule', () => {
      expect(typeof maxUnionSizeRule.create).toBe('function')
    })
  })

  describe('detecting large unions', () => {
    test('should report union with more than 5 types (default)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('6')
      expect(reports[0].message).toContain('5')
    })

    test('should report union with many types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(10))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('10')
    })

    test('should not report union with exactly 5 types (default)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(5))

      expect(reports.length).toBe(0)
    })

    test('should not report union with fewer than 5 types (default)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(3))

      expect(reports.length).toBe(0)
    })

    test('should not report non-union types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createNonUnionType())

      expect(reports.length).toBe(0)
    })

    test('should report union with exactly 6 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
    })

    test('should report union with 7 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(7))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('7')
    })

    test('should report union with 8 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(8))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('8')
    })

    test('should report union with 15 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(15))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('15')
    })

    test('should report union with 20 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(20))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('20')
    })

    test('should report union with 50 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(50))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('50')
    })

    test('should report union with 100 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(100))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('100')
    })

    test('should not report union with 1 type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(1))

      expect(reports.length).toBe(0)
    })

    test('should not report union with 2 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(2))

      expect(reports.length).toBe(0)
    })

    test('should not report union with 4 types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(4))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - max', () => {
    test('should respect custom max value', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('4')
      expect(reports[0].message).toContain('3')
    })

    test('should not report when union size equals custom max', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(3))

      expect(reports.length).toBe(0)
    })

    test('should not report when union size is less than custom max', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 10 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(8))

      expect(reports.length).toBe(0)
    })

    test('should handle max value of 1', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 1 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(2))

      expect(reports.length).toBe(1)
    })

    test('should handle max value of 2', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 2 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('3')
      expect(reports[0].message).toContain('2')
    })

    test('should not report with max=2 and 2 types', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 2 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(2))

      expect(reports.length).toBe(0)
    })

    test('should handle max value of 7', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 7 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(8))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('8')
      expect(reports[0].message).toContain('7')
    })

    test('should not report with max=7 and 7 types', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 7 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(7))

      expect(reports.length).toBe(0)
    })

    test('should handle max value of 10', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 10 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(11))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('11')
      expect(reports[0].message).toContain('10')
    })

    test('should handle max value of 20', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 20 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(21))

      expect(reports.length).toBe(1)
    })

    test('should handle max value of 50', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 50 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(51))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('51')
    })

    test('should report with max=3 and 4 types', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(4))

      expect(reports.length).toBe(1)
    })

    test('should not report with max=3 and 2 types', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(2))

      expect(reports.length).toBe(0)
    })

    test('should not report with max=3 and 1 type', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(1))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType('string')).not.toThrow()
      expect(() => visitor.TSUnionType(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'A' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'B' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'C' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'D' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'E' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'F' } },
        ],
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

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
        getSource: () => 'type X = A | B | C;',
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

      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType(createUnionType(6))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without types array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty types array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null types property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with types as a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with types as a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with types as an object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: { length: 6 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType(true)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType(0)).not.toThrow()
    })

    test('should handle empty string node', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType('')).not.toThrow()
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSLiteralType',
        types: Array.from({ length: 10 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `Type${i}` },
        })),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        types: Array.from({ length: 10 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `Type${i}` },
        })),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 42,
        types: Array.from({ length: 10 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `Type${i}` },
        })),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: true,
        types: Array.from({ length: 10 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `Type${i}` },
        })),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle options with extra unknown properties', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ max: 3, extraProp: 'ignored' }],
      })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('4')
      expect(reports[0].message).toContain('3')
    })

    test('should handle node with null entries in types array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [null, null, null, null, null, null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined entries in types array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [undefined, undefined, undefined, undefined, undefined, undefined],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with mixed valid and null entries', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'A' } },
          null,
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'B' } },
          null,
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'C' } },
          { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'D' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with options as non-array object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'type X = A | B | C;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: { max: 3 } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
    })

    test('should handle config with options as string', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'type X = A | B | C;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: 'not-an-array' },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      expect(() => visitor.TSUnionType(createUnionType(6))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with options[0] as null', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'type X = A | B | C;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      expect(() => visitor.TSUnionType(createUnionType(6))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with options[0] as number', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'type X = A | B | C;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [42] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      expect(() => visitor.TSUnionType(createUnionType(6))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with options[0] as empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('5')
    })

    test('should handle node as array', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      expect(() => visitor.TSUnionType([])).not.toThrow()
    })

    test('should handle node with undefined type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: undefined,
        types: Array.from({ length: 10 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `Type${i}` },
        })),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      expect(() => visitor.TSUnionType(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].loc).toBeDefined()
    })

    test('should include start in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 3, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should include end in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at zero column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 5, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 1, 200))

      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: Array.from({ length: 6 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `T${i}` },
        })),
      }

      visitor.TSUnionType(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: Array.from({ length: 6 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `T${i}` },
        })),
        loc: {
          start: { line: 5, column: 3 },
        },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node with non-numeric line in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: Array.from({ length: 6 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `T${i}` },
        })),
        loc: {
          start: { line: 'abc', column: 0 },
          end: { line: 'def', column: 10 },
        },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with non-numeric column in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: Array.from({ length: 6 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `T${i}` },
        })),
        loc: {
          start: { line: 1, column: 'bad' },
          end: { line: 1, column: 'bad' },
        },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention union in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].message.toLowerCase()).toContain('union')
    })

    test('should mention member count in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(8))

      expect(reports[0].message).toContain('8')
    })

    test('should mention maximum in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(4))

      expect(reports[0].message.toLowerCase()).toContain('maximum')
    })

    test('should suggest refactoring in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].message.toLowerCase()).toContain('refactor')
    })

    test('should mention members in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].message.toLowerCase()).toContain('member')
    })

    test('should mention exceeds in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].message.toLowerCase()).toContain('exceeds')
    })

    test('should suggest discriminated union in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].message.toLowerCase()).toContain('discriminated')
    })

    test('should return message as a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should include actual count and default max in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(8))

      expect(reports[0].message).toContain('8')
      expect(reports[0].message).toContain('5')
    })

    test('should include actual count and custom max in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(7))

      expect(reports[0].message).toContain('7')
      expect(reports[0].message).toContain('3')
    })

    test('should produce message for union exceeding by 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports[0].message).toContain('6')
      expect(reports[0].message).toContain('5')
    })

    test('should produce message for union exceeding by many', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(50))

      expect(reports[0].message).toContain('50')
      expect(reports[0].message).toContain('5')
    })

    test('should have consistent message format across different sizes', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const visitor1 = maxUnionSizeRule.create(ctx1)
      visitor1.TSUnionType(createUnionType(6))

      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor2 = maxUnionSizeRule.create(ctx2)
      visitor2.TSUnionType(createUnionType(10))

      expect(r1[0].message).toContain('Union type has')
      expect(r2[0].message).toContain('Union type has')
    })
  })

  describe('multiple reports', () => {
    test('should report each large union separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))
      visitor.TSUnionType(createUnionType(8))

      expect(reports.length).toBe(2)
    })

    test('should report each large union with correct counts', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))
      visitor.TSUnionType(createUnionType(10))

      expect(reports[0].message).toContain('6')
      expect(reports[1].message).toContain('10')
    })

    test('should only report unions exceeding the limit', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(3))
      visitor.TSUnionType(createUnionType(6))
      visitor.TSUnionType(createUnionType(4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('6')
    })

    test('should handle many reports for many violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.TSUnionType(createUnionType(6))
      }

      expect(reports.length).toBe(10)
    })

    test('should not report for any union at or below limit', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(1))
      visitor.TSUnionType(createUnionType(2))
      visitor.TSUnionType(createUnionType(3))
      visitor.TSUnionType(createUnionType(4))
      visitor.TSUnionType(createUnionType(5))

      expect(reports.length).toBe(0)
    })

    test('should handle mixed valid and invalid unions', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(2))
      visitor.TSUnionType(createUnionType(4))
      visitor.TSUnionType(createUnionType(3))
      visitor.TSUnionType(createUnionType(5))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('4')
      expect(reports[1].message).toContain('5')
    })

    test('should report for same node called twice', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)
      const node = createUnionType(6)

      visitor.TSUnionType(node)
      visitor.TSUnionType(node)

      expect(reports.length).toBe(2)
    })

    test('should report for different nodes with same violation count', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 1, 0))
      visitor.TSUnionType(createUnionType(6, 5, 10))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })
  })

  describe('export verification', () => {
    test('should export maxUnionSizeRule as named export', () => {
      expect(maxUnionSizeRule).toBeDefined()
    })

    test('should have meta on exported rule', () => {
      expect(maxUnionSizeRule.meta).toBeDefined()
      expect(typeof maxUnionSizeRule.meta).toBe('object')
    })

    test('should have create on exported rule', () => {
      expect(maxUnionSizeRule.create).toBeDefined()
      expect(typeof maxUnionSizeRule.create).toBe('function')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(maxUnionSizeRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('create should accept RuleContext', () => {
      const { context } = createMockRuleContext()
      expect(() => maxUnionSizeRule.create(context)).not.toThrow()
    })

    test('calling create multiple times should be idempotent', () => {
      const { context } = createMockRuleContext()
      const visitor1 = maxUnionSizeRule.create(context)
      const visitor2 = maxUnionSizeRule.create(context)

      expect(typeof visitor1.TSUnionType).toBe('function')
      expect(typeof visitor2.TSUnionType).toBe('function')
    })
  })

  describe('boundary conditions', () => {
    test('should report for union size exactly 1 above default max', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('6')
      expect(reports[0].message).toContain('5')
    })

    test('should not report for union size exactly at default max', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(5))

      expect(reports.length).toBe(0)
    })

    test('should report for union size 1 above custom max of 1', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 1 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(2))

      expect(reports.length).toBe(1)
    })

    test('should not report for union size exactly at custom max of 1', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 1 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(1))

      expect(reports.length).toBe(0)
    })

    test('should handle boundary at max value 2', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 2 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(2))
      expect(reports.length).toBe(0)

      visitor.TSUnionType(createUnionType(3))
      expect(reports.length).toBe(1)
    })

    test('should handle boundary at max value 5 (default)', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 5 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(5))
      expect(reports.length).toBe(0)

      visitor.TSUnionType(createUnionType(6))
      expect(reports.length).toBe(1)
    })

    test('should handle boundary at max value 10', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 10 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(10))
      expect(reports.length).toBe(0)

      visitor.TSUnionType(createUnionType(11))
      expect(reports.length).toBe(1)
    })

    test('should report for 0 types with max=0 should not report since 0 > 0 is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 0 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(0))

      expect(reports.length).toBe(0)
    })

    test('should report for 1 type with max=0', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 0 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(1))

      expect(reports.length).toBe(1)
    })

    test('should not report for 5 types with max=5', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 5 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(5))

      expect(reports.length).toBe(0)
    })

    test('should use default max when max is undefined in options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: undefined }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('5')
    })

    test('should use default max when max is null in options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: null }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
    })

    test('should report for very large union with default max', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(200))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('200')
    })

    test('should not report for union exactly at large custom max', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 100 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(100))

      expect(reports.length).toBe(0)
    })
  })

  describe('visitor return value', () => {
    test('TSUnionType should return undefined for valid node', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const result = visitor.TSUnionType(createUnionType(6))

      expect(result).toBeUndefined()
    })

    test('TSUnionType should return undefined for null node', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const result = visitor.TSUnionType(null)

      expect(result).toBeUndefined()
    })

    test('TSUnionType should return undefined for non-violating union', () => {
      const { context } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const result = visitor.TSUnionType(createUnionType(3))

      expect(result).toBeUndefined()
    })
  })

  describe('context interaction', () => {
    test('should call report exactly once for a violation', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(6))

      expect(reportCount).toBe(1)
    })

    test('should not call report for non-violating union', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(3))

      expect(reportCount).toBe(0)
    })

    test('should not call report for null node', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(null)

      expect(reportCount).toBe(0)
    })

    test('should pass message string to report', () => {
      let reportedMessage = ''
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reportedMessage = d.message
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(6))

      expect(reportedMessage.length).toBeGreaterThan(0)
    })

    test('should pass loc object to report', () => {
      let reportedLoc: unknown = null
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reportedLoc = d.loc
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(6, 3, 7))

      expect(reportedLoc).toBeDefined()
      const loc = reportedLoc as { start: { line: number; column: number } }
      expect(loc.start.line).toBe(3)
      expect(loc.start.column).toBe(7)
    })

    test('should work with visitor called many times in sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      for (let size = 1; size <= 20; size++) {
        visitor.TSUnionType(createUnionType(size))
      }

      expect(reports.length).toBe(15)
    })
  })

  describe('schema structure', () => {
    test('should have schema as an array with exactly one element', () => {
      const schema = maxUnionSizeRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema).toHaveLength(1)
    })

    test('should have schema element with type object', () => {
      const schema = maxUnionSizeRule.meta.schema
      const first = (schema as unknown[])[0] as Record<string, unknown>
      expect(first.type).toBe('object')
    })

    test('should have max property in schema properties', () => {
      const schema = maxUnionSizeRule.meta.schema
      const first = (schema as unknown[])[0] as Record<string, unknown>
      const props = first.properties as Record<string, Record<string, unknown>>
      expect(props.max).toBeDefined()
      expect(props.max.type).toBe('number')
    })

    test('should have max default value of 5 in schema', () => {
      const schema = maxUnionSizeRule.meta.schema
      const first = (schema as unknown[])[0] as Record<string, unknown>
      const props = first.properties as Record<string, Record<string, unknown>>
      expect(props.max.default).toBe(5)
    })

    test('should have max minimum of 1 in schema', () => {
      const schema = maxUnionSizeRule.meta.schema
      const first = (schema as unknown[])[0] as Record<string, unknown>
      const props = first.properties as Record<string, Record<string, unknown>>
      expect(props.max.minimum).toBe(1)
    })
  })

  describe('docs metadata', () => {
    test('should have description longer than 20 characters', () => {
      expect(maxUnionSizeRule.meta.docs?.description?.length ?? 0).toBeGreaterThan(20)
    })

    test('should have url in docs', () => {
      expect(maxUnionSizeRule.meta.docs?.url).toBeDefined()
      expect(maxUnionSizeRule.meta.docs?.url?.length).toBeGreaterThan(0)
    })

    test('should have url starting with https', () => {
      expect(maxUnionSizeRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('should have url containing max-union-size', () => {
      expect(maxUnionSizeRule.meta.docs?.url).toContain('max-union-size')
    })

    test('should have description mentioning enforce', () => {
      expect(maxUnionSizeRule.meta.docs?.description.toLowerCase()).toContain('enforce')
    })

    test('should have description mentioning maximum number', () => {
      const desc = maxUnionSizeRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('maximum')
    })
  })

  describe('union types with varied content', () => {
    test('should count types correctly regardless of type names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSLiteralType', literal: { value: 'a' } },
          { type: 'TSLiteralType', literal: { value: 'b' } },
          { type: 'TSLiteralType', literal: { value: 'c' } },
          { type: 'TSLiteralType', literal: { value: 'd' } },
          { type: 'TSLiteralType', literal: { value: 'e' } },
          { type: 'TSLiteralType', literal: { value: 'f' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(1)
    })

    test('should count types with duplicate names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: Array.from({ length: 7 }, () => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'SameType' },
        })),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('7')
    })

    test('should handle types with various AST node types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSStringKeyword' },
          { type: 'TSNumberKeyword' },
          { type: 'TSBooleanKeyword' },
          { type: 'TSNullKeyword' },
          { type: 'TSUndefinedKeyword' },
          { type: 'TSVoidKeyword' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('6')
    })

    test('should not report for keyword union at default max', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSStringKeyword' },
          { type: 'TSNumberKeyword' },
          { type: 'TSBooleanKeyword' },
          { type: 'TSNullKeyword' },
          { type: 'TSUndefinedKeyword' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('options precedence', () => {
    test('should use explicit max over default', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 2 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('3')
      expect(reports[0].message).toContain('2')
    })

    test('should use default max when no options provided', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('5')
    })

    test('should use provided max even when larger than default', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 20 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      expect(reports.length).toBe(0)
    })

    test('should use provided max when smaller than default', () => {
      const { context, reports } = createMockRuleContext({ options: [{ max: 2 }] })
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(3))

      expect(reports.length).toBe(1)
    })
  })

  describe('rule immutability', () => {
    test('should not modify meta across create calls', () => {
      const { context } = createMockRuleContext()
      const typeBefore = maxUnionSizeRule.meta.type
      maxUnionSizeRule.create(context)
      expect(maxUnionSizeRule.meta.type).toBe(typeBefore)
    })

    test('should not modify severity across create calls', () => {
      const { context } = createMockRuleContext()
      const severityBefore = maxUnionSizeRule.meta.severity
      maxUnionSizeRule.create(context)
      expect(maxUnionSizeRule.meta.severity).toBe(severityBefore)
    })

    test('should produce consistent results for same input', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ options: [{ max: 3 }] })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ options: [{ max: 3 }] })

      const visitor1 = maxUnionSizeRule.create(ctx1)
      const visitor2 = maxUnionSizeRule.create(ctx2)

      visitor1.TSUnionType(createUnionType(4))
      visitor2.TSUnionType(createUnionType(4))

      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
    })
  })

  describe('end location in report', () => {
    test('should include end line in report location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 3, 5))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should include end column in report location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType',
        types: Array.from({ length: 6 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `T${i}` },
        })),
        loc: {
          start: { line: 2, column: 5 },
          end: { line: 2, column: 80 },
        },
      }

      visitor.TSUnionType(node)

      expect(reports[0].loc?.end.column).toBe(80)
    })
  })

  describe('visitor isolation', () => {
    test('visitors from different contexts should be independent', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ options: [{ max: 3 }] })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ options: [{ max: 10 }] })

      const visitor1 = maxUnionSizeRule.create(ctx1)
      const visitor2 = maxUnionSizeRule.create(ctx2)

      visitor1.TSUnionType(createUnionType(5))
      visitor2.TSUnionType(createUnionType(5))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('visitor should not be affected by subsequent create calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ options: [{ max: 3 }] })
      const visitor1 = maxUnionSizeRule.create(ctx1)

      const { context: ctx2 } = createMockRuleContext({ options: [{ max: 20 }] })
      maxUnionSizeRule.create(ctx2)

      visitor1.TSUnionType(createUnionType(4))

      expect(r1.length).toBe(1)
    })
  })

  describe('node type specificity', () => {
    test('should only count nodes with exact TSUnionType type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'TSUnionType_EXTRA',
        types: Array.from({ length: 10 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `T${i}` },
        })),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(0)
    })

    test('should be case sensitive for TSUnionType', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      const node = {
        type: 'tsuniontype',
        types: Array.from({ length: 10 }, (_, i) => ({
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: `T${i}` },
        })),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.TSUnionType(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('report descriptor completeness', () => {
    test('report should contain both message and loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6, 7, 12))

      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].message.length).toBeGreaterThan(0)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('report loc should have all four coordinates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))

      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(loc?.start).toBeDefined()
      expect(loc?.end).toBeDefined()
      expect(typeof loc?.start.line).toBe('number')
      expect(typeof loc?.start.column).toBe('number')
      expect(typeof loc?.end.line).toBe('number')
      expect(typeof loc?.end.column).toBe('number')
    })

    test('report message should be unique per violation count', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)

      visitor.TSUnionType(createUnionType(6))
      visitor.TSUnionType(createUnionType(10))

      expect(reports[0].message).not.toBe(reports[1].message)
    })
  })

  describe('comprehensive boundary matrix', () => {
    test('should report for max=1 with sizes 2 through 6', () => {
      const sizes = [2, 3, 4, 5, 6]
      for (const size of sizes) {
        const { context, reports } = createMockRuleContext({ options: [{ max: 1 }] })
        const visitor = maxUnionSizeRule.create(context)
        visitor.TSUnionType(createUnionType(size))
        expect(reports.length, `expected report for size ${size} with max=1`).toBe(1)
      }
    })

    test('should not report for max=5 with sizes 1 through 5', () => {
      for (let size = 1; size <= 5; size++) {
        const { context, reports } = createMockRuleContext({ options: [{ max: 5 }] })
        const visitor = maxUnionSizeRule.create(context)
        visitor.TSUnionType(createUnionType(size))
        expect(reports.length, `expected no report for size ${size} with max=5`).toBe(0)
      }
    })
  })

  describe('additional meta checks', () => {
    test('meta should have exactly expected top-level keys', () => {
      const metaKeys = Object.keys(maxUnionSizeRule.meta)
      expect(metaKeys).toContain('type')
      expect(metaKeys).toContain('severity')
      expect(metaKeys).toContain('docs')
      expect(metaKeys).toContain('schema')
    })

    test('docs should have exactly expected keys', () => {
      const docsKeys = Object.keys(maxUnionSizeRule.meta.docs ?? {})
      expect(docsKeys).toContain('description')
      expect(docsKeys).toContain('category')
      expect(docsKeys).toContain('recommended')
      expect(docsKeys).toContain('url')
    })

    test('should have exactly two top-level keys on rule', () => {
      const ruleKeys = Object.keys(maxUnionSizeRule)
      expect(ruleKeys).toHaveLength(2)
    })
  })

  describe('message format verification', () => {
    test('message should follow expected template format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(9))

      const msg = reports[0].message
      expect(msg).toContain('Union type has 9 members')
      expect(msg).toContain('maximum of 5')
    })

    test('message should contain structured type suggestion', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = maxUnionSizeRule.create(context)
      visitor.TSUnionType(createUnionType(6))

      const msg = reports[0].message.toLowerCase()
      expect(msg).toContain('structured type')
    })
  })
})
