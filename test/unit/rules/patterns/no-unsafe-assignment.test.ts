import { describe, test, expect, vi } from 'vitest'
import { noUnsafeAssignmentRule } from '../../../../src/rules/patterns/no-unsafe-assignment.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x: string = value as any;',
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

describe('no-unsafe-assignment rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeAssignmentRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeAssignmentRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeAssignmentRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeAssignmentRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnsafeAssignmentRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnsafeAssignmentRule.meta.fixable).toBeUndefined()
    })

    test('should mention unsafe assignment in description', () => {
      expect(noUnsafeAssignmentRule.meta.docs?.description.toLowerCase()).toContain('unsafe')
    })

    test('schema should allow allowAnyInGenericArrays option', () => {
      const schema = noUnsafeAssignmentRule.meta.schema?.[0] as Record<string, unknown>
      expect(schema?.type).toBe('object')
      const properties = schema?.properties as Record<string, unknown> | undefined
      expect(properties?.allowAnyInGenericArrays).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(visitor).toHaveProperty('Property')
    })
  })

  describe('VariableDeclarator - unsafe assignments', () => {
    test('should report variable with specific type assigned as any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'myVar',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myVar')
      expect(reports[0].message).toContain('any')
    })

    test('should report variable with specific type assigned via type assertion to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSNumberKeyword',
            },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
        loc: {
          start: { line: 2, column: 0 },
          end: { line: 2, column: 20 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('value')
    })

    test('should report array of any assigned to typed variable when not allowed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'items',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSArrayType',
              elementType: {
                type: 'TSStringKeyword',
              },
            },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: {
            type: 'TSAnyKeyword',
          },
        },
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 3, column: 30 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
    })

    test('should include variable name in error message when available', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'data',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports[0].message).toContain('data')
    })

    test('should have generic message when variable name not available', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe assignment')
      expect(reports[0].message).toBe(
        "Unsafe assignment of an 'any' value. This bypasses type safety.",
      )
    })
  })

  describe('VariableDeclarator - valid assignments', () => {
    test('should not report variable without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'myVar',
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable with any type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'myVar',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSAnyKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable assigned non-any value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'result',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'Literal',
          value: 'hello',
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable with no initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should allow array of any when option is enabled', () => {
      const { context, reports } = createMockContext({ allowAnyInGenericArrays: true })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'items',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSArrayType',
              elementType: {
                type: 'TSStringKeyword',
              },
            },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('AssignmentExpression - unsafe assignments', () => {
    test('should report assignment of as any value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
        loc: {
          start: { line: 5, column: 0 },
          end: { line: 5, column: 15 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report assignment of type assertion to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: 'y',
        },
        right: {
          type: 'TSTypeAssertion',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('y')
    })

    test('should report assignment of array of any when not allowed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: 'arr',
        },
        right: {
          type: 'TSArrayType',
          elementType: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should have generic message when left side not an identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'MemberExpression',
        },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe assignment')
    })
  })

  describe('AssignmentExpression - valid assignments', () => {
    test('should not report assignment of non-any value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: 'z',
        },
        right: {
          type: 'Literal',
          value: 42,
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should allow array of any when option is enabled', () => {
      const { context, reports } = createMockContext({ allowAnyInGenericArrays: true })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: 'arr',
        },
        right: {
          type: 'TSArrayType',
          elementType: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('Property - unsafe assignments', () => {
    test('should report property with as any value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'name',
        },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
        loc: {
          start: { line: 10, column: 0 },
          end: { line: 10, column: 25 },
        },
      }

      visitor.Property(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('name')
    })

    test('should report property with type assertion to any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'age',
        },
        value: {
          type: 'TSTypeAssertion',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.Property(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('age')
    })

    test('should report property with array of any when not allowed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'items',
        },
        value: {
          type: 'TSArrayType',
          elementType: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should mention property in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'data',
        },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.Property(node)

      expect(reports[0].message).toContain('property')
      expect(reports[0].message).toContain('data')
    })

    test('should have generic message when key not an identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Literal',
          value: 'dynamic',
        },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.Property(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('property')
    })
  })

  describe('Property - valid assignments', () => {
    test('should not report property with non-any value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'value',
        },
        value: {
          type: 'Literal',
          value: 'test',
        },
      }

      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should allow array of any when option is enabled', () => {
      const { context, reports } = createMockContext({ allowAnyInGenericArrays: true })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'items',
        },
        value: {
          type: 'TSArrayType',
          elementType: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.Property(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowAnyInGenericArrays', () => {
    test('should allow any in arrays when option is true', () => {
      const { context, reports } = createMockContext({ allowAnyInGenericArrays: true })
      const visitor = noUnsafeAssignmentRule.create(context)

      const varNode = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(varNode)

      expect(reports.length).toBe(0)
    })

    test('should still report as expression with any when allowAnyInGenericArrays is true', () => {
      const { context, reports } = createMockContext({ allowAnyInGenericArrays: true })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should still report type assertion with any when allowAnyInGenericArrays is true', () => {
      const { context, reports } = createMockContext({ allowAnyInGenericArrays: true })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null VariableDeclarator node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined VariableDeclarator node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object VariableDeclarator node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle null AssignmentExpression node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined AssignmentExpression node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle null Property node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor.Property(null)).not.toThrow()
    })

    test('should handle undefined Property node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor.Property(undefined)).not.toThrow()
    })

    test('should handle VariableDeclarator without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator without init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression without right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: 'x',
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle Property without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'x',
        },
      }

      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should handle TSAsExpression without typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle TSTypeAssertion without typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSTypeAssertion',
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle TSArrayType without elementType', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSArrayType',
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options array', () => {
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
        getSource: () => 'const x: string = value as any;',
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

      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-any type in as expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSStringKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-any type in type assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: {
            type: 'TSStringKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle array with non-any element type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: {
            type: 'TSStringKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention type safety in all messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports[0].message.toLowerCase()).toContain('type safety')
    })

    test('should mention bypasses in messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSStringKeyword',
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: {
            type: 'TSAnyKeyword',
          },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports[0].message.toLowerCase()).toContain('bypass')
    })
  })
})
