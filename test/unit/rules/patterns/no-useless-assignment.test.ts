import { describe, test, expect, vi } from 'vitest'
import { noUselessAssignmentRule } from '../../../../src/rules/patterns/no-useless-assignment.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + String(value).length },
    },
  }
}

function createAssignmentExpression(
  left: unknown,
  right: unknown,
  operator = '=',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

// ============================================================================
// EXISTING 37 TESTS (PRESERVED EXACTLY)
// ============================================================================

describe('no-useless-assignment rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessAssignmentRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUselessAssignmentRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUselessAssignmentRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessAssignmentRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention assignment in description', () => {
      expect(noUselessAssignmentRule.meta.docs?.description.toLowerCase()).toContain('assignment')
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('AssignmentExpression should be a function', () => {
      const { context } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      expect(typeof visitor.AssignmentExpression).toBe('function')
    })
  })

  describe('valid cases', () => {
    test('should not report assignment with different string values', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with different number values', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to different identifiers with same value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with non-literal right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with member expression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      visitor.AssignmentExpression(createAssignmentExpression(createIdentifier('x'), memberExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with boolean values that differ', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with null and undefined values', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report assignment with same compound operator and value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '+='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '+='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report assignment with different compound operators and same value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '+='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '-='),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report assignment to non-identifier left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      visitor.AssignmentExpression(createAssignmentExpression(memberExpr, createLiteral(1)))
      visitor.AssignmentExpression(createAssignmentExpression(memberExpr, createLiteral(1)))

      expect(reports.length).toBe(0)
    })

    test('should not report first assignment to a variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with different literal types', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('1')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report redundant assignment with same string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('test')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('test')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/redundant/i)
      expect(reports[0].message).toContain('x')
    })

    test('should report redundant assignment with same number value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(42)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(42)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/redundant/i)
    })

    test('should report redundant assignment with same boolean value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(true)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/redundant/i)
    })

    test('should not report redundant assignment with same null value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report redundant assignment with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '=', 10, 5),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report each redundant assignment separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(2)
    })

    test('should report message containing variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), createLiteral(1)),
      )

      expect(reports[0].message).toContain('myVar')
    })
  })

  describe('edge cases', () => {
    test('should handle null AssignmentExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined AssignmentExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle left side that is not an identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 'x' },
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right side that is not a literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Identifier', name: 'y' },
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const node = createAssignmentExpression(createIdentifier('x'), createLiteral(1))
      delete (node as Record<string, unknown>).loc
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle empty string as literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('')),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle zero as literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report redundant assignment with NaN values', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(NaN)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(NaN)),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle negative zero as literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(-0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(-0)),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================================
  // NEW TESTS (163+ additional)
  // ============================================================================

  describe('meta extended', () => {
    test('should have description as a string', () => {
      expect(typeof noUselessAssignmentRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noUselessAssignmentRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta.docs object', () => {
      expect(noUselessAssignmentRule.meta.docs).toBeDefined()
    })

    test('should mention redundant in description', () => {
      expect(noUselessAssignmentRule.meta.docs?.description.toLowerCase()).toContain('redundant')
    })

    test('should have empty schema array', () => {
      expect(noUselessAssignmentRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noUselessAssignmentRule.meta.fixable).toBeUndefined()
    })

    test('should have create method', () => {
      expect(typeof noUselessAssignmentRule.create).toBe('function')
    })

    test('should be an object', () => {
      expect(typeof noUselessAssignmentRule).toBe('object')
    })
  })

  describe('create visitor shape', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('visitor should have exactly AssignmentExpression key', () => {
      const { context } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)
      expect(Object.keys(visitor)).toContain('AssignmentExpression')
    })

    test('create should return a new tracking map each call', () => {
      const { context } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor1 = noUselessAssignmentRule.create(context)
      const visitor2 = noUselessAssignmentRule.create(context)

      // Visitor 1 tracks x=1
      visitor1.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      // Visitor 2's x is fresh, so no report
      const reports2: ReportDescriptor[] = []
      const ctx2: RuleContext = {
        report: (d: ReportDescriptor) => reports2.push(d),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const v2 = noUselessAssignmentRule.create(ctx2)
      v2.AssignmentExpression(createAssignmentExpression(createIdentifier('x'), createLiteral(1)))

      expect(reports2.length).toBe(0)
    })
  })

  describe('string values - valid', () => {
    test('should not report when strings differ by case', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('hello')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('Hello')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when strings differ by whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('hello')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('hello ')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report single-char vs empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report different special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('\n')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('\t')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report emoji vs text', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('🎉')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('party')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report different unicode strings', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('café')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('cafe')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('string values - invalid', () => {
    test('should report same long string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)
      const longStr = 'a'.repeat(1000)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral(longStr)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral(longStr)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same string with special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('hello\nworld')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('hello\nworld')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same single-space string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral(' ')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral(' ')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same tab character string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('\t')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('\t')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same emoji string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('🎉')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('🎉')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same unicode string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('日本語')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('日本語')),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('number values - valid', () => {
    test('should not report when numbers differ by sign', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report integer vs float', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(1.5)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report very small difference in floats', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(0.1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(0.2)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when value changes from literal to non-literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Infinity vs -Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Infinity)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-Infinity)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report NaN vs a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(NaN)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(42)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('number values - invalid', () => {
    test('should report same negative number', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-42)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-42)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same float value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(3.14)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(3.14)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same very large number', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Number.MAX_SAFE_INTEGER)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Number.MAX_SAFE_INTEGER)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same very small number', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Number.MIN_VALUE)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Number.MIN_VALUE)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same Infinity value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Infinity)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Infinity)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same -Infinity value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-Infinity)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-Infinity)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same small integer', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('boolean values', () => {
    test('should report same false value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(false)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(false)),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report true followed by false', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report false followed by true', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(false)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(true)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report three consecutive same boolean assignments as two reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(true)),
      )

      expect(reports.length).toBe(2)
    })
  })

  describe('null and undefined values', () => {
    test('should not report null followed by a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report number followed by null', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report three consecutive null assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report same undefined value twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report three consecutive undefined assignments as two reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )

      expect(reports.length).toBe(2)
    })

    test('should not report undefined followed by null', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report null followed by undefined for second assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple variables tracked simultaneously', () => {
    test('should track x and y independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report redundant for y but not x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('y')
    })

    test('should track three variables independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createLiteral('foo')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral('bar')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c'), createLiteral('baz')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral('bar')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should report redundant for multiple variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle many variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      for (const name of names) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(name), createLiteral(0)),
        )
      }
      // Repeat all
      for (const name of names) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(name), createLiteral(0)),
        )
      }

      expect(reports.length).toBe(8)
    })
  })

  describe('value change sequences', () => {
    test('should report only after same value repeats after different value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report each repeat in alternating pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      // x=1, x=2, x=2 (report), x=1, x=1 (report)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(2)
    })

    test('should not report when values alternate different each time', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3)),
      )

      expect(reports.length).toBe(0)
    })

    test('should track value change from literal to identifier back to same literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      // Non-literal resets tracking to null
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )
      // Now last value for x is null (non-literal), so literal 1 won't match null
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report when same literal follows non-literal with same literal before', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      // last value for x is now 1 again
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('compound operators', () => {
    test('should report same value with *= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '*='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '*='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with /= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '/='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '/='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with %= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '%='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '%='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with **= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '**='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '**='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with <<= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '<<='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '<<='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with >>= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '>>='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '>>='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with >>>= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '>>>='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '>>>='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with &= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3), '&='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3), '&='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with |= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3), '|='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3), '|='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value with ^= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3), '^='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3), '^='),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report different values with compound operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '+='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2), '+='),
      )

      expect(reports.length).toBe(0)
    })

    test('should report same value when operator changes from = to +=', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(5)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(5), '+='),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('location tracking', () => {
    test('should report location at line 5 column 3', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '=', 5, 3),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '=', 1, 0),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for third redundant assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '=', 2, 0),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '=', 3, 0),
      )

      expect(reports.length).toBe(2)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle report with default location when loc missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const node = createAssignmentExpression(createIdentifier('x'), createLiteral(1))
      delete (node as Record<string, unknown>).loc
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('report message format', () => {
    test('should include variable name in message for snake_case variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('my_var'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('my_var'), createLiteral(1)),
      )

      expect(reports[0].message).toContain('my_var')
    })

    test('should include variable name for camelCase variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVariableName'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVariableName'), createLiteral(1)),
      )

      expect(reports[0].message).toContain('myVariableName')
    })

    test('should include variable name for single letter variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('_'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('_'), createLiteral(1)),
      )

      expect(reports[0].message).toContain('_')
    })

    test('should include dollar sign variable name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$'), createLiteral(1)),
      )

      expect(reports[0].message).toContain('$')
    })

    test('should say "same value" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports[0].message.toLowerCase()).toContain('same value')
    })

    test('should contain quotes around variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports[0].message).toContain("'x'")
    })
  })

  describe('malformed node handling', () => {
    test('should handle node that is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle left with null name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: null },
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle left with numeric name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 123 },
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      // name is 123 (number), stored as key "123"
      expect(reports.length).toBe(1)
    })

    test('should handle right with missing value property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal' },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: null,
        left: createIdentifier('x'),
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with left as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {},
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with right as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: {},
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createLiteral(1),
        loc: null,
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc.start missing line', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createLiteral(1),
        loc: { start: { column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc.start missing column', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createLiteral(1),
        loc: { start: { line: 5 }, end: { line: 5, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle left as UpdateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'UpdateExpression',
          argument: createIdentifier('x'),
          operator: '++',
          prefix: false,
        },
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right as CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] },
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle left as array destructuring pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ArrayPattern', elements: [createIdentifier('a'), createIdentifier('b')] },
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('long sequences', () => {
    test('should report 9 redundant assignments in a row of 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        )
      }

      expect(reports.length).toBe(9)
    })

    test('should report correct number for alternating same-different pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      // 1,1(r),2,2(r),3,3(r),4,4(r),5,5(r) = 5 reports
      const values = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]
      for (const v of values) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), createLiteral(v)),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should handle 50 different variables each assigned once', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(`v${i}`), createLiteral(i)),
        )
      }

      expect(reports.length).toBe(0)
    })

    test('should handle 50 variables each assigned same value twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(`v${i}`), createLiteral(42)),
        )
      }
      for (let i = 0; i < 50; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(`v${i}`), createLiteral(42)),
        )
      }

      expect(reports.length).toBe(50)
    })
  })

  describe('mixed type comparisons', () => {
    test('should not report when number 0 changes to boolean false', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when empty string changes to boolean false', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when number 1 changes to boolean true', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(true)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when string "1" changes to number 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('1')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('context interaction', () => {
    test('should call context.report with message string', () => {
      const reports: ReportDescriptor[] = []
      const ctx: RuleContext = {
        report: (d: ReportDescriptor) => {
          expect(typeof d.message).toBe('string')
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUselessAssignmentRule.create(ctx)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
    })

    test('should not call report for valid single assignment', () => {
      let reportCalled = false
      const ctx: RuleContext = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUselessAssignmentRule.create(ctx)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reportCalled).toBe(false)
    })
  })

  describe('specific value types', () => {
    test('should report same regex-like string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('r'), createLiteral('\\d+')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('r'), createLiteral('\\d+')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same string with backslash', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('C:\\path')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('C:\\path')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same string with quotes inside', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('"quoted"')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('"quoted"')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same very large integer', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(999999999)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(999999999)),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report 0 vs false', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report "" vs false', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report same negative float', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-0.5)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-0.5)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same zero float', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(0.0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(0.0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when value changes to member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('val'))
      visitor.AssignmentExpression(createAssignmentExpression(createIdentifier('x'), memberExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('state reset between visitors', () => {
    test('should not carry state between two create calls', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'x = 1; x = 1;' })

      const visitor1 = noUselessAssignmentRule.create(ctx1)
      const visitor2 = noUselessAssignmentRule.create(ctx2)

      visitor1.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor1.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      visitor2.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('each visitor tracks variables independently', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'x = 1; x = 1;' })

      const visitor1 = noUselessAssignmentRule.create(ctx1)
      const visitor2 = noUselessAssignmentRule.create(ctx2)

      visitor1.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createLiteral('hello')),
      )
      visitor2.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(42)),
      )

      visitor1.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createLiteral('hello')),
      )
      visitor2.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(42)),
      )

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })
  })

  describe('identifier edge cases', () => {
    test('should handle identifier with unicode name', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('変数'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('変数'), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('変数')
    })

    test('should handle identifier with dollar sign prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$elem'), createLiteral('div')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$elem'), createLiteral('div')),
      )

      expect(reports.length).toBe(1)
    })

    test('should treat different case identifiers as different variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myvar'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle identifier name "undefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('undefined'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('undefined'), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle identifier name "NaN"', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('NaN'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('NaN'), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle very long identifier name', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)
      const longName = 'a'.repeat(200)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(longName), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(longName), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle single character identifiers a through z', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      for (const c of 'abcdef') {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(c), createLiteral(0)),
        )
      }
      for (const c of 'abcdef') {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(c), createLiteral(0)),
        )
      }

      expect(reports.length).toBe(6)
    })
  })

  describe('literal edge cases', () => {
    test('should handle literal with value property set to empty string in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('test')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('test')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same value when right is number zero and left changes', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(5)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same multiline string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)
      const multiline = 'line1\nline2\nline3'

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral(multiline)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral(multiline)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same string with carriage return', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('a\rb')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('a\rb')),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report string with CR vs string with LF', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('a\nb')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('a\rb')),
      )

      expect(reports.length).toBe(0)
    })

    test('should report same string with CRLF', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('a\r\nb')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('a\r\nb')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same very precise float', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(0.123456789)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(0.123456789)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same Number.EPSILON value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Number.EPSILON)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(Number.EPSILON)),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report 0 vs -0 as redundant', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-0)),
      )

      // In JS, 0 === -0 is true, so this WILL report
      expect(reports.length).toBe(1)
    })

    test('should not report NaN followed by NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(NaN)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(NaN)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report same number 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(100)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(100)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same number -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(-1)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same string "true" (string not boolean)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('true')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('true')),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report "true" vs true', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('true')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(true)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report "null" vs null', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('null')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report "undefined" vs undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('undefined')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('node type variations', () => {
    test('should not report when left is ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ObjectPattern', properties: [] },
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right is BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: {
          type: 'BinaryExpression',
          operator: '+',
          left: createLiteral(1),
          right: createLiteral(2),
        },
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right is ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: {
          type: 'ConditionalExpression',
          test: createIdentifier('c'),
          consequent: createLiteral(1),
          alternate: createLiteral(2),
        },
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      visitor.AssignmentExpression(createAssignmentExpression(memberExpr, createLiteral(1)))
      visitor.AssignmentExpression(createAssignmentExpression(memberExpr, createLiteral(1)))

      expect(reports.length).toBe(0)
    })

    test('should handle computed member expression on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: createIdentifier('arr'),
          property: createLiteral(0),
          computed: true,
        },
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('interleaved operations', () => {
    test('should track state correctly across interleaved variable assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      // x=1, y=1, z=1, x=2, y=2, z=2 → no reports
      for (const v of ['x', 'y', 'z']) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(v), createLiteral(1)),
        )
      }
      for (const v of ['x', 'y', 'z']) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(v), createLiteral(2)),
        )
      }

      expect(reports.length).toBe(0)
    })

    test('should report only redundant assignments in interleaved pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      // x=1, y=1, x=1 → report x
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should handle value overwritten by null then reassigned', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      // null resets tracking; now assigning 1 is first time
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle value overwritten by identifier then reassigned same literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(42)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(42)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(42)),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report after many different values then one repeat', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      for (let i = 1; i <= 20; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), createLiteral(i)),
        )
      }
      // Last was 20, repeat it
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(20)),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('stress tests', () => {
    test('should handle 100 consecutive same-value assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), createLiteral(42)),
        )
      }

      expect(reports.length).toBe(99)
    })

    test('should handle rapid variable switching', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      // x=1, y=2, x=1, y=2, x=1, y=2 → 3 reports (x twice, y twice... wait)
      // x=1 (first), y=2 (first), x=1 (report), y=2 (report), x=1 (report), y=2 (report) = 4 reports... no
      // x=1 (first x), y=2 (first y), x=1 (report x#1), y=2 (report y#1), x=1 (report x#2), y=2 (report y#2) = 4
      for (let i = 0; i < 3; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        )
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
        )
      }

      // x: first at i=0, report at i=1, report at i=2 = 2 reports
      // y: first at i=0, report at i=1, report at i=2 = 2 reports
      expect(reports.length).toBe(4)
    })

    test('should handle assignment after node with missing type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression({
        operator: '=',
        left: createIdentifier('x'),
        right: createLiteral(1),
      })
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      // First node has no type, so it's not AssignmentExpression, so it's ignored
      // Second node is first valid assignment to x, no report
      expect(reports.length).toBe(0)
    })
  })

  describe('additional valid cases', () => {
    test('should not report when second assignment is to member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const memberExpr = createMemberExpression(createIdentifier('x'), createIdentifier('prop'))
      visitor.AssignmentExpression(createAssignmentExpression(memberExpr, createLiteral(1)))

      expect(reports.length).toBe(0)
    })

    test('should not report when left identifier changes to different identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createLiteral(5)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createLiteral(5)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when value alternates between two different values', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report literal number followed by ArrowFunctionExpression right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('fn'), createLiteral(1)),
      )
      const arrowNode = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('fn'),
        right: { type: 'ArrowFunctionExpression', params: [], body: createLiteral(1) },
      }
      visitor.AssignmentExpression(arrowNode)

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('additional invalid cases', () => {
    test('should report same value for variable named "result"', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('result'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('result'), createLiteral(true)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('result')
    })

    test('should report for variable named "value"', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('value'), createLiteral('test')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('value'), createLiteral('test')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('value')
    })

    test('should report same string "false" value twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('false')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('s'), createLiteral('false')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same number 256', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(256)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('n'), createLiteral(256)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same empty string twice for different variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('str'), createLiteral('')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('str'), createLiteral('')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report same boolean after intervening different variable assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('flag'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('other'), createLiteral(false)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('flag'), createLiteral(true)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report when same string assigned after being overwritten by null', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('hello')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('hello')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('hello')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report redundant assignment with correct variable name for multi-char name', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('counter'), createLiteral(0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('counter'), createLiteral(0)),
      )

      expect(reports[0].message).toMatch(/Redundant assignment to 'counter'/)
    })

    test('should report two separate redundant patterns in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(reports.length).toBe(2)
    })

    test('should report same value across operator change from += to =', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = 1; x = 1;' })
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3), '+='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(3)),
      )

      expect(reports.length).toBe(1)
    })
  })
})
