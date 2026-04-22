import { describe, test, expect, vi } from 'vitest'
import { noUnsafeAssignmentRule } from '../../../../src/rules/patterns/no-unsafe-assignment.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

describe('no-unsafe-assignment rule', () => {
  // ─── META TESTS (20+) ───────────────────────────────────────────────
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

    test('should have docs property', () => {
      expect(noUnsafeAssignmentRule.meta.docs).toBeDefined()
    })

    test('should have a description string in docs', () => {
      expect(typeof noUnsafeAssignmentRule.meta.docs?.description).toBe('string')
      expect(noUnsafeAssignmentRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should have docs url defined', () => {
      expect(noUnsafeAssignmentRule.meta.docs?.url).toBeDefined()
      expect(typeof noUnsafeAssignmentRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnsafeAssignmentRule.meta.schema)).toBe(true)
    })

    test('should have exactly one schema entry', () => {
      expect(noUnsafeAssignmentRule.meta.schema).toHaveLength(1)
    })

    test('schema entry should be an object', () => {
      const schema = noUnsafeAssignmentRule.meta.schema?.[0]
      expect(typeof schema).toBe('object')
    })

    test('schema should have additionalProperties set to false', () => {
      const schema = noUnsafeAssignmentRule.meta.schema?.[0] as Record<string, unknown>
      expect(schema?.additionalProperties).toBe(false)
    })

    test('allowAnyInGenericArrays schema should have boolean type', () => {
      const schema = noUnsafeAssignmentRule.meta.schema?.[0] as Record<string, unknown>
      const properties = schema?.properties as Record<string, unknown>
      const prop = properties?.allowAnyInGenericArrays as Record<string, unknown>
      expect(prop?.type).toBe('boolean')
    })

    test('allowAnyInGenericArrays schema should have default false', () => {
      const schema = noUnsafeAssignmentRule.meta.schema?.[0] as Record<string, unknown>
      const properties = schema?.properties as Record<string, unknown>
      const prop = properties?.allowAnyInGenericArrays as Record<string, unknown>
      expect(prop?.default).toBe(false)
    })

    test('meta type should be a string', () => {
      expect(typeof noUnsafeAssignmentRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof noUnsafeAssignmentRule.meta.severity).toBe('string')
    })

    test('recommended flag should be a boolean', () => {
      expect(typeof noUnsafeAssignmentRule.meta.docs?.recommended).toBe('boolean')
    })

    test('description should mention any type', () => {
      expect(noUnsafeAssignmentRule.meta.docs?.description.toLowerCase()).toContain('any')
    })
  })

  // ─── CREATE / VISITOR TESTS (8) ──────────────────────────────────────
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(visitor).toHaveProperty('Property')
    })

    test('should return exactly three visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys).toHaveLength(3)
    })

    test('visitor methods should be functions', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(typeof visitor.VariableDeclarator).toBe('function')
      expect(typeof visitor.AssignmentExpression).toBe('function')
      expect(typeof visitor.Property).toBe('function')
    })

    test('should create visitor with empty options', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('should create visitor with allowAnyInGenericArrays true', () => {
      const { context } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('should create independent visitors for each call', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor1 = noUnsafeAssignmentRule.create(context)
      const visitor2 = noUnsafeAssignmentRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should handle being called multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(2)
    })

    test('create should not throw with valid context', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      expect(() => noUnsafeAssignmentRule.create(context)).not.toThrow()
    })
  })

  // ─── DETECTION TESTS (30+) ──────────────────────────────────────────
  describe('VariableDeclarator - unsafe assignments', () => {
    test('should report variable with specific type assigned as any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'myVar',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
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
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSNumberKeyword' },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
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
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
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
              elementType: { type: 'TSStringKeyword' },
            },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
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
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'data',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].message).toContain('data')
    })

    test('should report TSNumberKeyword typed variable with as any init', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'num',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSNumberKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should report TSBooleanKeyword typed variable with as any init', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'flag',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSBooleanKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should report TSStringKeyword typed variable with TSTypeAssertion to any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'str',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should report variable with TSArrayType type and any init', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'arr',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: {
              type: 'TSArrayType',
              elementType: { type: 'TSNumberKeyword' },
            },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should report when init is TSArrayType with TSAnyKeyword element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'result',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should detect TSAsExpression with any in nested type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'nested',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('AssignmentExpression - unsafe assignments', () => {
    test('should report assignment of as any value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
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
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'y' },
        right: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('y')
    })

    test('should report assignment of array of any when not allowed', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'arr' },
        right: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should have generic message when left side not an identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'MemberExpression' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe assignment')
    })

    test('should report assignment to obj.prop with as any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should include identifier name in message when left is Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'target' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports[0].message).toContain('target')
    })

    test('should detect TSTypeAssertion with any in assignment right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'val' },
        right: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('val')
    })

    test('should detect TSArrayType with any in assignment right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'list' },
        right: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('list')
    })
  })

  describe('Property - unsafe assignments', () => {
    test('should report property with as any value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'name' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
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
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'age' },
        value: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('age')
    })

    test('should report property with array of any when not allowed', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'items' },
        value: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('should mention property in error message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'data' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports[0].message).toContain('property')
      expect(reports[0].message).toContain('data')
    })

    test('should have generic message when key not an identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Literal', value: 'dynamic' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('property')
    })

    test('should report property with TSAsExpression to any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'config' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('config')
    })

    test('should report property with TSTypeAssertion to any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'options' },
        value: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('options')
    })
  })

  // ─── NOT REPORTING TESTS (30+) ─────────────────────────────────────
  describe('VariableDeclarator - valid assignments', () => {
    test('should not report variable without type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'myVar' },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report variable with any type annotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'myVar',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report variable assigned non-any value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'result',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: { type: 'Literal', value: 'hello' },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report variable with no initializer', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'value',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should allow array of any when option is enabled', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
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
              elementType: { type: 'TSStringKeyword' },
            },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report variable typed as any receiving as any', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'anything',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when init is a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'data',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when init is a Literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'num',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSNumberKeyword' },
          },
        },
        init: { type: 'Literal', value: 42 },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when init is a TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'text',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: { type: 'TemplateLiteral' },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report TSAsExpression with non-any type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'str',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSStringKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report TSTypeAssertion with non-any type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'num',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSNumberKeyword' },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSNumberKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report TSArrayType with non-any element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'items',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSStringKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when id is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [],
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has no inner typeAnnotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('AssignmentExpression - valid assignments', () => {
    test('should not report assignment of non-any value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'z' },
        right: { type: 'Literal', value: 42 },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should allow array of any when option is enabled', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'arr' },
        right: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment of string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'name' },
        right: { type: 'Literal', value: 'Alice' },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment with TSAsExpression to string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'str' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSStringKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment with TSAsExpression to number type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'num' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSNumberKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment with TSTypeAssertion to string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'val' },
        right: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSStringKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment of CallExpression result', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'result' },
        right: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment of TSArrayType with string element when allowAnyInGenericArrays enabled', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'arr' },
        right: {
          type: 'TSArrayType',
          elementType: { type: 'TSStringKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment without right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment with right side as BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'sum' },
        right: { type: 'BinaryExpression' },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('Property - valid assignments', () => {
    test('should not report property with non-any value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'value' },
        value: { type: 'Literal', value: 'test' },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('should allow array of any when option is enabled', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'items' },
        value: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('should not report property with string literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'label' },
        value: { type: 'Literal', value: 'text' },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('should not report property with number literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'count' },
        value: { type: 'Literal', value: 10 },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('should not report property with identifier value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'ref' },
        value: { type: 'Identifier', name: 'other' },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('should not report property with TSAsExpression to string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'val' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSStringKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('should not report property with TSTypeAssertion to number type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'num' },
        value: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSNumberKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('should not report property without value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'x' },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })
  })

  // ─── EDGE CASES (25+) ──────────────────────────────────────────────
  describe('edge cases', () => {
    test('should handle null VariableDeclarator node', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined VariableDeclarator node', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object VariableDeclarator node', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle null AssignmentExpression node', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined AssignmentExpression node', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle null Property node', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.Property(null)).not.toThrow()
    })

    test('should handle undefined Property node', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.Property(undefined)).not.toThrow()
    })

    test('should handle VariableDeclarator without id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      visitor.VariableDeclarator({ type: 'VariableDeclarator' })
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator without init', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression without right', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle Property without value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'x' },
      }

      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('should handle TSAsExpression without typeAnnotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: { type: 'TSAsExpression' },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle TSTypeAssertion without typeAnnotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: { type: 'TSTypeAssertion' },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle TSArrayType without elementType', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: { type: 'TSArrayType' },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle empty options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x: string = value as any;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
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
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should handle non-any type in as expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSStringKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle non-any type in type assertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSStringKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle array with non-any element type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSStringKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node for VariableDeclarator', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
    })

    test('should handle numeric node for AssignmentExpression', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
    })

    test('should handle string node for Property', () => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() => visitor.Property('node')).not.toThrow()
    })

    test('should handle node with id that has no typeAnnotation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with id that is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern' },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with null left', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: null,
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Property with null key', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: null,
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Property with key that has no name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('property')
    })
  })

  // ─── LOCATION TESTS (15+) ──────────────────────────────────────────
  describe('location reporting', () => {
    test('should include location in VariableDeclarator report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 3, column: 5 },
          end: { line: 3, column: 25 },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should include location in AssignmentExpression report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'y' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 7, column: 0 },
          end: { line: 7, column: 15 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should include location in Property report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'prop' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 12, column: 4 },
          end: { line: 12, column: 20 },
        },
      }

      visitor.Property(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].loc).toBeDefined()
    })

    test('should preserve exact start and end positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'pos',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 10, column: 2 },
          end: { line: 10, column: 35 },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start).toEqual({ line: 10, column: 2 })
      expect(reports[0].loc?.end).toEqual({ line: 10, column: 35 })
    })

    test('should handle multi-line node location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'multi',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 5, column: 0 },
          end: { line: 8, column: 1 },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('should use default location when loc is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: null,
      }

      visitor.AssignmentExpression(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should provide default location for Property without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'key' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should correctly report column number from node location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'indented',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 1, column: 8 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should include end column from node location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'z' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 42 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports[0].loc?.end.column).toBe(42)
    })

    test('should handle loc with only start property gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'partial' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 2, column: 0 },
          end: { line: 2, column: 1 },
        },
      }

      visitor.Property(node)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should report location for AssignmentExpression with MemberExpression left', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'MemberExpression' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 15, column: 0 },
          end: { line: 15, column: 10 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should report location for Property with Literal key', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Literal', value: 'computed' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 20, column: 4 },
          end: { line: 20, column: 25 },
        },
      }

      visitor.Property(node)
      expect(reports[0].loc?.start.line).toBe(20)
    })

    test('should return default location for undefined loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'noLoc',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve line zero in node location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'edge',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 1 },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(0)
    })
  })

  // ─── MESSAGE TESTS (10+) ───────────────────────────────────────────
  describe('message quality', () => {
    test('should mention type safety in all messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].message.toLowerCase()).toContain('type safety')
    })

    test('should mention bypasses in messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].message.toLowerCase()).toContain('bypass')
    })

    test('should have generic message when variable name not available', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        "Unsafe assignment of an 'any' value. This bypasses type safety.",
      )
    })

    test('should include variable name in named variable message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'myData',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].message).toContain("'myData'")
    })

    test('should include property name in named property message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'myProp' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports[0].message).toContain("'myProp'")
    })

    test('should include assignment target in named assignment message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'target' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports[0].message).toContain("'target'")
    })

    test('should mention any in all messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'z',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].message.toLowerCase()).toContain('any')
    })

    test('should have property-specific message for Property nodes without key name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Literal', value: 123 },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports[0].message).toContain('property')
      expect(reports[0].message).not.toContain("'123'")
    })

    test('should have consistent message format for VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'testVar',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports[0].message).toMatch(/Unsafe assignment of an 'any' value/)
      expect(reports[0].message).toMatch(/bypasses type safety/)
    })

    test('should have consistent message format for Property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'testProp' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.Property(node)
      expect(reports[0].message).toMatch(/Unsafe assignment of an 'any' value/)
      expect(reports[0].message).toMatch(/bypasses type safety/)
    })

    test('should have consistent message format for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'testAssign' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports[0].message).toMatch(/Unsafe assignment of an 'any' value/)
      expect(reports[0].message).toMatch(/bypasses type safety/)
    })
  })

  // ─── MULTIPLE REPORTS TESTS (10+) ──────────────────────────────────
  describe('multiple reports', () => {
    test('should report each unsafe variable separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const makeNode = (name: string) => ({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name,
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      visitor.VariableDeclarator(makeNode('a'))
      visitor.VariableDeclarator(makeNode('b'))
      visitor.VariableDeclarator(makeNode('c'))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
      expect(reports[2].message).toContain('c')
    })

    test('should report mixed visitor types separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'v',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      visitor.Property({
        type: 'Property',
        key: { type: 'Identifier', name: 'p' },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(3)
    })

    test('should track reports independently across visitor methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'safe',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: { type: 'Literal', value: 'ok' },
      })

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'unsafe' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unsafe')
    })

    test('should report all unsafe assignments from different init types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'a',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'b',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSNumberKeyword' },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'c',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSBooleanKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
      expect(reports[2].message).toContain('c')
    })

    test('should not count safe assignments in report total', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      // safe
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'safe' },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      // unsafe
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'unsafe',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(1)
    })

    test('should report multiple Property violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const makeProp = (name: string) => ({
        type: 'Property',
        key: { type: 'Identifier', name },
        value: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      visitor.Property(makeProp('a'))
      visitor.Property(makeProp('b'))

      expect(reports.length).toBe(2)
    })

    test('should report multiple AssignmentExpression violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const makeAssign = (name: string) => ({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      visitor.AssignmentExpression(makeAssign('x'))
      visitor.AssignmentExpression(makeAssign('y'))

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports correctly with mixed safe and unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      // unsafe
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'u1' },
        right: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      // safe
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 's1' },
        right: { type: 'Literal', value: 1 },
      })

      // unsafe
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'u2' },
        right: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('u1')
      expect(reports[1].message).toContain('u2')
    })

    test('should report array of any separately for each visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'arr1',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      })

      visitor.Property({
        type: 'Property',
        key: { type: 'Identifier', name: 'arr2' },
        value: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(2)
    })

    test('should handle rapid sequential calls without state corruption', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: `var${i}`,
            typeAnnotation: {
              type: 'TypeAnnotation',
              typeAnnotation: { type: 'TSStringKeyword' },
            },
          },
          init: {
            type: 'TSAsExpression',
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        })
      }

      expect(reports.length).toBe(5)
    })
  })

  // ─── CONTEXT TESTS (10+) ───────────────────────────────────────────
  describe('context interaction', () => {
    test('should call context.report exactly once for unsafe VariableDeclarator', () => {
      const reports: ReportDescriptor[] = []
      const mockReport = vi.fn((descriptor: ReportDescriptor) => {
        reports.push(descriptor)
      })
      const context = {
        report: mockReport,
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeAssignmentRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should not call context.report for safe VariableDeclarator', () => {
      const mockReport = vi.fn()
      const context = {
        report: mockReport,
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeAssignmentRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 1 },
      })

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not call context.report for safe AssignmentExpression', () => {
      const mockReport = vi.fn()
      const context = {
        report: mockReport,
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeAssignmentRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      })

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not call context.report for safe Property', () => {
      const mockReport = vi.fn()
      const context = {
        report: mockReport,
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeAssignmentRule.create(context)
      visitor.Property({
        type: 'Property',
        key: { type: 'Identifier', name: 'x' },
        value: { type: 'Literal', value: 'safe' },
      })

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should respect different file paths in context', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;', filePath: '/custom/path.ts' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(1)
    })

    test('should work with undefined config options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: undefined },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() =>
        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'x',
            typeAnnotation: {
              type: 'TypeAnnotation',
              typeAnnotation: { type: 'TSStringKeyword' },
            },
          },
          init: {
            type: 'TSAsExpression',
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        }),
      ).not.toThrow()
    })

    test('should work with null config options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeAssignmentRule.create(context)
      expect(() =>
        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'x',
            typeAnnotation: {
              type: 'TypeAnnotation',
              typeAnnotation: { type: 'TSStringKeyword' },
            },
          },
          init: {
            type: 'TSAsExpression',
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        }),
      ).not.toThrow()
    })

    test('should create separate reports for different contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ options: [{
        allowAnyInGenericArrays: true,
      }], source: 'const x: string = value as any;' })

      const visitor1 = noUnsafeAssignmentRule.create(ctx1)
      const visitor2 = noUnsafeAssignmentRule.create(ctx2)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor1.VariableDeclarator(node)
      visitor2.VariableDeclarator(node)

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should handle context with string option for allowAnyInGenericArrays', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: 'true' }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      // String 'true' is truthy via spread merge, so arrays of any are allowed
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(0)
    })
  })

  // ─── OPTIONS TESTS ──────────────────────────────────────────────────
  describe('options - allowAnyInGenericArrays', () => {
    test('should allow any in arrays when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should still report as expression with any when allowAnyInGenericArrays is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSAsExpression',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should still report type assertion with any when allowAnyInGenericArrays is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSTypeAssertion',
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should report any in arrays when option is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: false }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should report any in arrays by default when no option provided', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          typeAnnotation: {
            type: 'TypeAnnotation',
            typeAnnotation: { type: 'TSStringKeyword' },
          },
        },
        init: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('should apply allowAnyInGenericArrays to AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'arr' },
        right: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should apply allowAnyInGenericArrays to Property', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowAnyInGenericArrays: true }], source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.Property({
        type: 'Property',
        key: { type: 'Identifier', name: 'items' },
        value: {
          type: 'TSArrayType',
          elementType: { type: 'TSAnyKeyword' },
        },
      })

      expect(reports.length).toBe(0)
    })
  })

  // ─── test.each PARAMETERIZED TESTS (40+) ───────────────────────────
  describe('parameterized - unsafe type annotation detection', () => {
    test.each([
      { typeAnnotation: 'TSStringKeyword', name: 'strVar' },
      { typeAnnotation: 'TSNumberKeyword', name: 'numVar' },
      { typeAnnotation: 'TSBooleanKeyword', name: 'boolVar' },
      { typeAnnotation: 'TSVoidKeyword', name: 'voidVar' },
      { typeAnnotation: 'TSNullKeyword', name: 'nullVar' },
      { typeAnnotation: 'TSUndefinedKeyword', name: 'undefVar' },
      { typeAnnotation: 'TSNeverKeyword', name: 'neverVar' },
      { typeAnnotation: 'TSObjectKeyword', name: 'objVar' },
      { typeAnnotation: 'TSSymbolKeyword', name: 'symVar' },
      { typeAnnotation: 'TSBigIntKeyword', name: 'bigVar' },
    ] as const)(
      'should report $name with $typeAnnotation type and as any init',
      ({ typeAnnotation, name }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
        const visitor = noUnsafeAssignmentRule.create(context)

        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name,
            typeAnnotation: {
              type: 'TypeAnnotation',
              typeAnnotation: { type: typeAnnotation },
            },
          },
          init: {
            type: 'TSAsExpression',
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        })

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
      },
    )
  })

  describe('parameterized - safe type annotations with non-any init', () => {
    test.each([
      { typeAnnotation: 'TSStringKeyword', name: 'safeStr' },
      { typeAnnotation: 'TSNumberKeyword', name: 'safeNum' },
      { typeAnnotation: 'TSBooleanKeyword', name: 'safeBool' },
      { typeAnnotation: 'TSVoidKeyword', name: 'safeVoid' },
      { typeAnnotation: 'TSNullKeyword', name: 'safeNull' },
      { typeAnnotation: 'TSUndefinedKeyword', name: 'safeUndef' },
      { typeAnnotation: 'TSObjectKeyword', name: 'safeObj' },
      { typeAnnotation: 'TSSymbolKeyword', name: 'safeSym' },
      { typeAnnotation: 'TSBigIntKeyword', name: 'safeBig' },
      { typeAnnotation: 'TSNeverKeyword', name: 'safeNever' },
    ] as const)(
      'should not report $name with $typeAnnotation and literal init',
      ({ typeAnnotation, name }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
        const visitor = noUnsafeAssignmentRule.create(context)

        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name,
            typeAnnotation: {
              type: 'TypeAnnotation',
              typeAnnotation: { type: typeAnnotation },
            },
          },
          init: { type: 'Literal', value: 'safe' },
        })

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized - visitor methods handle null and undefined', () => {
    test.each([
      { method: 'VariableDeclarator', value: null },
      { method: 'VariableDeclarator', value: undefined },
      { method: 'AssignmentExpression', value: null },
      { method: 'AssignmentExpression', value: undefined },
      { method: 'Property', value: null },
      { method: 'Property', value: undefined },
    ] as const)('should not throw when $method receives $value', ({ method, value }) => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor[method](value)).not.toThrow()
    })
  })

  describe('parameterized - primitive node types handled gracefully', () => {
    test.each([
      { method: 'VariableDeclarator', value: 42 },
      { method: 'VariableDeclarator', value: true },
      { method: 'AssignmentExpression', value: 'node' },
      { method: 'AssignmentExpression', value: 0 },
      { method: 'Property', value: false },
      { method: 'Property', value: '' },
    ] as const)('should not throw when $method receives primitive $value', ({ method, value }) => {
      const { context } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      expect(() => visitor[method](value)).not.toThrow()
    })
  })

  describe('parameterized - non-any type assertions are safe', () => {
    test.each([
      { assertionType: 'TSAsExpression', safeType: 'TSStringKeyword' },
      { assertionType: 'TSAsExpression', safeType: 'TSNumberKeyword' },
      { assertionType: 'TSAsExpression', safeType: 'TSBooleanKeyword' },
      { assertionType: 'TSTypeAssertion', safeType: 'TSStringKeyword' },
      { assertionType: 'TSTypeAssertion', safeType: 'TSNumberKeyword' },
      { assertionType: 'TSTypeAssertion', safeType: 'TSBooleanKeyword' },
    ] as const)(
      'should not report $assertionType with $safeType type',
      ({ assertionType, safeType }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
        const visitor = noUnsafeAssignmentRule.create(context)

        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'safeVar',
            typeAnnotation: {
              type: 'TypeAnnotation',
              typeAnnotation: { type: 'TSStringKeyword' },
            },
          },
          init: {
            type: assertionType,
            typeAnnotation: { type: safeType },
          },
        })

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized - any type assertions are unsafe', () => {
    test.each([{ assertionType: 'TSAsExpression' }, { assertionType: 'TSTypeAssertion' }] as const)(
      'should report $assertionType with TSAnyKeyword type',
      ({ assertionType }) => {
        const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
        const visitor = noUnsafeAssignmentRule.create(context)

        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'unsafeVar',
            typeAnnotation: {
              type: 'TypeAnnotation',
              typeAnnotation: { type: 'TSStringKeyword' },
            },
          },
          init: {
            type: assertionType,
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        })

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('parameterized - AssignmentExpression detection across init types', () => {
    test.each([
      {
        desc: 'TSAsExpression with any',
        right: { type: 'TSAsExpression', typeAnnotation: { type: 'TSAnyKeyword' } },
        expected: 1,
      },
      {
        desc: 'TSTypeAssertion with any',
        right: { type: 'TSTypeAssertion', typeAnnotation: { type: 'TSAnyKeyword' } },
        expected: 1,
      },
      {
        desc: 'TSArrayType with any element',
        right: { type: 'TSArrayType', elementType: { type: 'TSAnyKeyword' } },
        expected: 1,
      },
      {
        desc: 'Literal value',
        right: { type: 'Literal', value: 42 },
        expected: 0,
      },
      {
        desc: 'CallExpression',
        right: { type: 'CallExpression' },
        expected: 0,
      },
      {
        desc: 'Identifier',
        right: { type: 'Identifier', name: 'other' },
        expected: 0,
      },
      {
        desc: 'BinaryExpression',
        right: { type: 'BinaryExpression' },
        expected: 0,
      },
      {
        desc: 'TSAsExpression with string',
        right: { type: 'TSAsExpression', typeAnnotation: { type: 'TSStringKeyword' } },
        expected: 0,
      },
    ] as const)('should report $expected violations for $desc', ({ right, expected }) => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'target' },
        right,
      })

      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized - Property detection across value types', () => {
    test.each([
      {
        desc: 'TSAsExpression with any',
        value: { type: 'TSAsExpression', typeAnnotation: { type: 'TSAnyKeyword' } },
        expected: 1,
      },
      {
        desc: 'TSTypeAssertion with any',
        value: { type: 'TSTypeAssertion', typeAnnotation: { type: 'TSAnyKeyword' } },
        expected: 1,
      },
      {
        desc: 'TSArrayType with any element',
        value: { type: 'TSArrayType', elementType: { type: 'TSAnyKeyword' } },
        expected: 1,
      },
      {
        desc: 'Literal value',
        value: { type: 'Literal', value: 'safe' },
        expected: 0,
      },
      {
        desc: 'Identifier value',
        value: { type: 'Identifier', name: 'ref' },
        expected: 0,
      },
      {
        desc: 'TSAsExpression with number',
        value: { type: 'TSAsExpression', typeAnnotation: { type: 'TSNumberKeyword' } },
        expected: 0,
      },
    ] as const)('should report $expected violations for $desc', ({ value, expected }) => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
      const visitor = noUnsafeAssignmentRule.create(context)

      visitor.Property({
        type: 'Property',
        key: { type: 'Identifier', name: 'propName' },
        value,
      })

      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized - message contains variable name', () => {
    test.each(['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'] as const)(
      'should include variable name %s in message',
      (varName) => {
        const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
        const visitor = noUnsafeAssignmentRule.create(context)

        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: varName,
            typeAnnotation: {
              type: 'TypeAnnotation',
              typeAnnotation: { type: 'TSStringKeyword' },
            },
          },
          init: {
            type: 'TSAsExpression',
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        })

        expect(reports[0].message).toContain(varName)
      },
    )
  })

  describe('parameterized - Property key names in messages', () => {
    test.each(['firstName', 'lastName', 'email', 'phone', 'address'] as const)(
      'should include property name %s in message',
      (propName) => {
        const { context, reports } = createMockRuleContext({ source: 'const x: string = value as any;' })
        const visitor = noUnsafeAssignmentRule.create(context)

        visitor.Property({
          type: 'Property',
          key: { type: 'Identifier', name: propName },
          value: {
            type: 'TSAsExpression',
            typeAnnotation: { type: 'TSAnyKeyword' },
          },
        })

        expect(reports[0].message).toContain(propName)
      },
    )
  })
})
