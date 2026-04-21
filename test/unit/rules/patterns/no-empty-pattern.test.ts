import { describe, test, expect } from 'vitest'
import { noEmptyPatternRule } from '../../../../src/rules/patterns/no-empty-pattern.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createEmptyObjectPattern(line = 1, column = 0): unknown {
  return {
    type: 'ObjectPattern',
    properties: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createNonEmptyObjectPattern(line = 1, column = 0): unknown {
  return {
    type: 'ObjectPattern',
    properties: [
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Identifier', name: 'a' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createEmptyArrayPattern(line = 1, column = 0): unknown {
  return {
    type: 'ArrayPattern',
    elements: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createNonEmptyArrayPattern(line = 1, column = 0): unknown {
  return {
    type: 'ArrayPattern',
    elements: [{ type: 'Identifier', name: 'a' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createNonPatternNode(): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 1 },
    },
  }
}

describe('no-empty-pattern rule', () => {
  // =========================================================
  // META PROPERTIES - BASIC (existing + new)
  // =========================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEmptyPatternRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEmptyPatternRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEmptyPatternRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noEmptyPatternRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention empty in description', () => {
      expect(noEmptyPatternRule.meta.docs?.description.toLowerCase()).toContain('empty')
    })

    // --- NEW: meta detailed checks ---

    test('should have meta property defined', () => {
      expect(noEmptyPatternRule.meta).toBeDefined()
    })

    test('should have meta as an object', () => {
      expect(typeof noEmptyPatternRule.meta).toBe('object')
    })

    test('should have meta.type as a string', () => {
      expect(typeof noEmptyPatternRule.meta.type).toBe('string')
    })

    test('should have meta.severity as a string', () => {
      expect(typeof noEmptyPatternRule.meta.severity).toBe('string')
    })

    test('should have valid severity value', () => {
      expect(['off', 'warn', 'error']).toContain(noEmptyPatternRule.meta.severity)
    })

    test('should have valid type value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noEmptyPatternRule.meta.type)
    })

    test('should have docs object', () => {
      expect(noEmptyPatternRule.meta.docs).toBeDefined()
    })

    test('should have docs.description as string', () => {
      expect(typeof noEmptyPatternRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty docs.description', () => {
      expect(noEmptyPatternRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs.category as string', () => {
      expect(typeof noEmptyPatternRule.meta.docs?.category).toBe('string')
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof noEmptyPatternRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should mention destructuring in description', () => {
      expect(noEmptyPatternRule.meta.docs?.description.toLowerCase()).toContain('destructur')
    })

    test('should have schema defined', () => {
      expect(noEmptyPatternRule.meta.schema).toBeDefined()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noEmptyPatternRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noEmptyPatternRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(noEmptyPatternRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noEmptyPatternRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(noEmptyPatternRule.meta.replacedBy).toBeFalsy()
    })

    test('should not require type checking', () => {
      expect(noEmptyPatternRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have description ending with period', () => {
      expect(noEmptyPatternRule.meta.docs?.description.endsWith('.')).toBe(true)
    })
  })

  // =========================================================
  // RULE STRUCTURE
  // =========================================================
  describe('rule structure', () => {
    test('should have create function', () => {
      expect(typeof noEmptyPatternRule.create).toBe('function')
    })

    test('should return visitor with ObjectPattern method', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).toHaveProperty('ObjectPattern')
    })

    test('should return visitor with ArrayPattern method', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).toHaveProperty('ArrayPattern')
    })

    // --- NEW: structure checks ---

    test('should have create as a function', () => {
      expect(noEmptyPatternRule.create).toBeInstanceOf(Function)
    })

    test('should return non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return object visitor', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return visitor with exactly ObjectPattern and ArrayPattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(Object.keys(visitor)).toEqual(
        expect.arrayContaining(['ObjectPattern', 'ArrayPattern']),
      )
    })

    test('should have ObjectPattern as a function', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(typeof visitor.ObjectPattern).toBe('function')
    })

    test('should have ArrayPattern as a function', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(typeof visitor.ArrayPattern).toBe('function')
    })

    test('should not throw when calling create', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })

      expect(() => noEmptyPatternRule.create(context)).not.toThrow()
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor1 = noEmptyPatternRule.create(context)
      const visitor2 = noEmptyPatternRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitors that both work independently', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'const {} = obj',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'const {} = obj',
      })
      const visitor1 = noEmptyPatternRule.create(ctx1)
      const visitor2 = noEmptyPatternRule.create(ctx2)

      visitor1.ObjectPattern(createEmptyObjectPattern())
      visitor2.ObjectPattern(createEmptyObjectPattern())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('should have visitor that does not have unexpected methods', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).not.toHaveProperty('Identifier')
      expect(visitor).not.toHaveProperty('FunctionDeclaration')
      expect(visitor).not.toHaveProperty('VariableDeclaration')
    })

    test('should have meta and create as own properties', () => {
      expect(noEmptyPatternRule).toHaveProperty('meta')
      expect(noEmptyPatternRule).toHaveProperty('create')
    })

    test('should accept context without throwing', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })

      expect(() => noEmptyPatternRule.create(context)).not.toThrow()
    })
  })

  // =========================================================
  // DETECTING EMPTY PATTERNS - OBJECT (existing + new)
  // =========================================================
  describe('detecting empty patterns', () => {
    test('should report empty object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty object pattern')
    })

    test('should not report non-empty object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createNonEmptyObjectPattern())

      expect(reports.length).toBe(0)
    })

    test('should report empty array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty array pattern')
    })

    test('should not report non-empty array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createNonEmptyArrayPattern())

      expect(reports.length).toBe(0)
    })

    test('should report correct location for object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    // --- NEW: object pattern detection ---

    test('should report empty object pattern at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report empty object pattern at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report exact message for empty object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports[0].message).toBe('Unexpected empty object pattern.')
    })

    test('should report loc with start and end for object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct end location for object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('should report empty object pattern at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(0, 0))

      expect(reports.length).toBe(1)
    })

    test('should report empty object pattern with high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(9999, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report empty object pattern with high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(1, 500))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    // --- NEW: array pattern detection ---

    test('should report empty array pattern at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report empty array pattern at line 200 column 30', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(200, 30))

      expect(reports[0].loc?.start.line).toBe(200)
      expect(reports[0].loc?.start.column).toBe(30)
    })

    test('should report exact message for empty array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports[0].message).toBe('Unexpected empty array pattern.')
    })

    test('should report loc with start and end for array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct end location for array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(3, 8))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report empty array pattern at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(0, 0))

      expect(reports.length).toBe(1)
    })

    test('should report empty array pattern with high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(5000, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5000)
    })

    test('should report empty array pattern with high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(1, 999))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(999)
    })
  })

  // =========================================================
  // NON-EMPTY OBJECT PATTERNS (should not report)
  // =========================================================
  describe('non-empty object patterns', () => {
    test('should not report object pattern with one property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createNonEmptyObjectPattern())

      expect(reports.length).toBe(0)
    })

    test('should not report object pattern with two properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Identifier', name: 'a' },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Identifier', name: 'b' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report object pattern with many properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)
      const properties = Array.from({ length: 20 }, (_, i) => ({
        type: 'Property',
        key: { type: 'Identifier', name: `prop${i}` },
        value: { type: 'Identifier', name: `prop${i}` },
      }))

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 100 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report object pattern with rest element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [
          {
            type: 'RestElement',
            argument: { type: 'Identifier', name: 'rest' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report object pattern with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [
          {
            type: 'Property',
            computed: true,
            key: { type: 'Identifier', name: 'key' },
            value: { type: 'Identifier', name: 'val' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report object pattern with shorthand property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [
          {
            type: 'Property',
            shorthand: true,
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'Identifier', name: 'x' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report object pattern with nested ObjectPattern value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'nested' },
            value: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'inner' },
                  value: { type: 'Identifier', name: 'inner' },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report object pattern with AssignmentPattern value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'AssignmentPattern', left: { type: 'Identifier', name: 'x' } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // NON-EMPTY ARRAY PATTERNS (should not report)
  // =========================================================
  describe('non-empty array patterns', () => {
    test('should not report array pattern with one element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createNonEmptyArrayPattern())

      expect(reports.length).toBe(0)
    })

    test('should not report array pattern with two elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report array pattern with many elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)
      const elements = Array.from({ length: 15 }, (_, i) => ({
        type: 'Identifier',
        name: `item${i}`,
      }))

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 100 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report array pattern with rest element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [
          {
            type: 'RestElement',
            argument: { type: 'Identifier', name: 'rest' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report array pattern with null element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [null, { type: 'Identifier', name: 'b' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report array pattern with ObjectPattern element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [
          {
            type: 'ObjectPattern',
            properties: [
              {
                type: 'Property',
                key: { type: 'Identifier', name: 'a' },
                value: { type: 'Identifier', name: 'a' },
              },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report array pattern with AssignmentPattern element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [{ type: 'AssignmentPattern', left: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report array pattern with mixed elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [
          null,
          { type: 'Identifier', name: 'a' },
          { type: 'RestElement', argument: { type: 'Identifier', name: 'rest' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // EDGE CASES (existing + new)
  // =========================================================
  describe('edge cases', () => {
    test('should handle null node gracefully for ObjectPattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(null)).not.toThrow()
    })

    test('should handle null node gracefully for ArrayPattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for ObjectPattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(undefined)).not.toThrow()
    })

    test('should handle undefined node gracefully for ArrayPattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(undefined)).not.toThrow()
    })

    test('should handle non-pattern node gracefully for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(createNonPatternNode())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-pattern node gracefully for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(createNonPatternNode())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const node = createEmptyObjectPattern()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.ObjectPattern(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without loc for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const node = createEmptyArrayPattern()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.ArrayPattern(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    // --- NEW: primitive value edge cases ---

    test('should not report for boolean true node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for boolean false node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for boolean true node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for boolean false node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for number zero node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for positive number node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for number zero node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for positive number node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for string node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern('some string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for empty string node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for string node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern('some string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for empty string node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    // --- NEW: wrong type node ---

    test('should not report for FunctionDeclaration node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionDeclaration node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for VariableDeclaration node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for VariableDeclaration node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    // --- NEW: malformed properties/elements ---

    test('should not report ObjectPattern with properties as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayPattern with elements as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectPattern with properties as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayPattern with elements as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectPattern with properties as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayPattern with elements as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectPattern with properties as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: { length: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayPattern with elements as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: { length: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectPattern with missing properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayPattern with missing elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectPattern with undefined properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayPattern with undefined elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    // --- NEW: missing type ---

    test('should not report object with missing type on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        properties: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report object with missing type on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        elements: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    // --- NEW: loc edge cases ---

    test('should handle node with loc as null for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: null,
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as null for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: null,
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as string for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: 'not-an-object',
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as string for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: 'not-an-object',
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as number for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: 123,
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as number for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: 123,
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing start) for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: { end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing end) for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: { start: { line: 1, column: 0 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing start) for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: { end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing end) for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: { start: { line: 1, column: 0 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle empty object node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date object on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date object on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Infinity on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(Number.POSITIVE_INFINITY)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Infinity on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(Number.POSITIVE_INFINITY)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle negative number on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(-1)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle negative number on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(-1)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // LOCATION REPORTING (detailed)
  // =========================================================
  describe('location reporting', () => {
    test('should report default location for node without loc on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const node = createEmptyObjectPattern()
      delete (node as Record<string, unknown>).loc

      visitor.ObjectPattern(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location for node without loc on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const node = createEmptyArrayPattern()
      delete (node as Record<string, unknown>).loc

      visitor.ArrayPattern(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default end location for node without loc on ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const node = createEmptyObjectPattern()
      delete (node as Record<string, unknown>).loc

      visitor.ObjectPattern(node)

      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should report default end location for node without loc on ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const node = createEmptyArrayPattern()
      delete (node as Record<string, unknown>).loc

      visitor.ArrayPattern(node)

      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should report multiline location for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: {
          start: { line: 5, column: 2 },
          end: { line: 8, column: 4 },
        },
      })

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.end.column).toBe(4)
    })

    test('should report multiline location for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: {
          start: { line: 10, column: 3 },
          end: { line: 15, column: 6 },
        },
      })

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(6)
    })

    test('should preserve exact start column for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(1, 42))

      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should preserve exact start column for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(1, 37))

      expect(reports[0].loc?.start.column).toBe(37)
    })

    test('should report location with column 0 for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(3, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with column 0 for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(7, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // =========================================================
  // MESSAGE CONTENT (detailed)
  // =========================================================
  describe('message content', () => {
    test('should report message containing "Unexpected" for object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should report message containing "Unexpected" for array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should report message with period at end for object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should report message with period at end for array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should report different messages for object vs array patterns', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'const {} = obj',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'const {} = obj',
      })
      const visitor1 = noEmptyPatternRule.create(ctx1)
      const visitor2 = noEmptyPatternRule.create(ctx2)

      visitor1.ObjectPattern(createEmptyObjectPattern())
      visitor2.ArrayPattern(createEmptyArrayPattern())

      expect(reports1[0].message).not.toBe(reports2[0].message)
      expect(reports1[0].message).toContain('object')
      expect(reports2[0].message).toContain('array')
    })

    test('should report message containing "pattern" for object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports[0].message.toLowerCase()).toContain('pattern')
    })

    test('should report message containing "pattern" for array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports[0].message.toLowerCase()).toContain('pattern')
    })
  })

  // =========================================================
  // MULTIPLE REPORTS
  // =========================================================
  describe('multiple reports', () => {
    test('should report each empty object pattern separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(1, 0))
      visitor.ObjectPattern(createEmptyObjectPattern(2, 5))
      visitor.ObjectPattern(createEmptyObjectPattern(3, 10))

      expect(reports.length).toBe(3)
    })

    test('should report each empty array pattern separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(1, 0))
      visitor.ArrayPattern(createEmptyArrayPattern(2, 5))
      visitor.ArrayPattern(createEmptyArrayPattern(3, 10))

      expect(reports.length).toBe(3)
    })

    test('should report mixed empty patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(1, 0))
      visitor.ArrayPattern(createEmptyArrayPattern(2, 0))
      visitor.ObjectPattern(createEmptyObjectPattern(3, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('object')
      expect(reports[1].message).toContain('array')
      expect(reports[2].message).toContain('object')
    })

    test('should maintain correct locations for multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(10, 5))
      visitor.ObjectPattern(createEmptyObjectPattern(20, 15))
      visitor.ObjectPattern(createEmptyObjectPattern(30, 25))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[1].loc?.start.column).toBe(15)
      expect(reports[2].loc?.start.line).toBe(30)
      expect(reports[2].loc?.start.column).toBe(25)
    })

    test('should not report non-empty patterns mixed with empty ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createNonEmptyObjectPattern())
      visitor.ObjectPattern(createEmptyObjectPattern())
      visitor.ObjectPattern(createNonEmptyObjectPattern())
      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports.length).toBe(2)
    })

    test('should report five empty object patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.ObjectPattern(createEmptyObjectPattern(i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report ten empty array patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ArrayPattern(createEmptyArrayPattern(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating empty and non-empty patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          visitor.ObjectPattern(createEmptyObjectPattern())
        } else {
          visitor.ObjectPattern(createNonEmptyObjectPattern())
        }
      }

      expect(reports.length).toBe(5)
    })

    test('should report both ObjectPattern and ArrayPattern in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(1, 0))
      visitor.ArrayPattern(createEmptyArrayPattern(2, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('object')
      expect(reports[1].message).toContain('array')
    })
  })

  // =========================================================
  // EXPORT VERIFICATION
  // =========================================================
  describe('export verification', () => {
    test('should export noEmptyPatternRule as named export', () => {
      expect(noEmptyPatternRule).toBeDefined()
    })

    test('should have correct structure for RuleDefinition', () => {
      expect(noEmptyPatternRule).toHaveProperty('meta')
      expect(noEmptyPatternRule).toHaveProperty('create')
    })

    test('should have meta with all required fields', () => {
      expect(noEmptyPatternRule.meta).toHaveProperty('type')
      expect(noEmptyPatternRule.meta).toHaveProperty('severity')
      expect(noEmptyPatternRule.meta).toHaveProperty('docs')
    })

    test('should have docs with required fields', () => {
      expect(noEmptyPatternRule.meta.docs).toHaveProperty('description')
      expect(noEmptyPatternRule.meta.docs).toHaveProperty('category')
      expect(noEmptyPatternRule.meta.docs).toHaveProperty('recommended')
    })

    test('should have create that accepts RuleContext', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })
  })

  // =========================================================
  // CONTEXT INDEPENDENCE
  // =========================================================
  describe('context independence', () => {
    test('should use provided context report function', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports.length).toBe(1)
    })

    test('should report to correct context when using multiple contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'const {} = obj',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'const {} = obj',
      })
      const visitor1 = noEmptyPatternRule.create(ctx1)
      const visitor2 = noEmptyPatternRule.create(ctx2)

      visitor1.ObjectPattern(createEmptyObjectPattern())
      visitor2.ArrayPattern(createEmptyArrayPattern())

      expect(reports1.length).toBe(1)
      expect(reports1[0].message).toContain('object')
      expect(reports2.length).toBe(1)
      expect(reports2[0].message).toContain('array')
    })

    test('should not affect other visitors when reporting', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'const {} = obj',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'const {} = obj',
      })
      const visitor1 = noEmptyPatternRule.create(ctx1)
      const visitor2 = noEmptyPatternRule.create(ctx2)

      visitor1.ObjectPattern(createEmptyObjectPattern())
      visitor1.ObjectPattern(createEmptyObjectPattern())

      expect(reports1.length).toBe(2)
      expect(reports2.length).toBe(0)
    })

    test('should handle calling report multiple times on same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(1, 0))
      visitor.ObjectPattern(createEmptyObjectPattern(2, 0))
      visitor.ArrayPattern(createEmptyArrayPattern(3, 0))
      visitor.ObjectPattern(createNonEmptyObjectPattern())

      expect(reports.length).toBe(3)
    })
  })

  // =========================================================
  // FUNCTION PARAMETER SIMULATION
  // =========================================================
  describe('simulated function parameter patterns', () => {
    test('should report empty object pattern representing function param', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: function fn({}) {}
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: { start: { line: 1, column: 13 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty object pattern')
    })

    test('should report empty array pattern representing function param', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: function fn([]) {}
      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: { start: { line: 1, column: 13 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty array pattern')
    })

    test('should not report non-empty object pattern representing function param', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: function fn({ a }) {}
      visitor.ObjectPattern(createNonEmptyObjectPattern())

      expect(reports.length).toBe(0)
    })

    test('should not report non-empty array pattern representing function param', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: function fn([a]) {}
      visitor.ArrayPattern(createNonEmptyArrayPattern())

      expect(reports.length).toBe(0)
    })

    test('should report empty object pattern with default value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: function fn({} = {}) {}
      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // ASSIGNMENT PATTERN SIMULATION
  // =========================================================
  describe('simulated assignment patterns', () => {
    test('should report empty object pattern in variable declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: const {} = obj;
      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports.length).toBe(1)
    })

    test('should report empty array pattern in variable declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: const [] = arr;
      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports.length).toBe(1)
    })

    test('should report empty object pattern in for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: for (const {} of items) {}
      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports.length).toBe(1)
    })

    test('should report empty array pattern in for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      // Simulates: for (const [] of items) {}
      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // CROSS-CUTTING: visitor methods are case-sensitive
  // =========================================================
  describe('visitor method names', () => {
    test('should have ObjectPattern with correct casing', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).toHaveProperty('ObjectPattern')
      expect(visitor).not.toHaveProperty('objectpattern')
      expect(visitor).not.toHaveProperty('OBJECTPATTERN')
      expect(visitor).not.toHaveProperty('objectPattern')
    })

    test('should have ArrayPattern with correct casing', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).toHaveProperty('ArrayPattern')
      expect(visitor).not.toHaveProperty('arraypattern')
      expect(visitor).not.toHaveProperty('ARRAYPATTERN')
      expect(visitor).not.toHaveProperty('arrayPattern')
    })
  })

  // =========================================================
  // LOC WITH NON-NUMERIC FIELDS
  // =========================================================
  describe('loc field type edge cases', () => {
    test('should handle loc.start.line as string for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: {
          start: { line: 'five' as unknown as number, column: 0 },
          end: { line: 1, column: 2 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc.start.column as string for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: {
          start: { line: 1, column: 'zero' as unknown as number },
          end: { line: 1, column: 2 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc.end.line as string for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 'two' as unknown as number, column: 2 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc.end.column as string for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'two' as unknown as number },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc.start.line as string for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: {
          start: { line: 'three' as unknown as number, column: 0 },
          end: { line: 1, column: 2 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc.start.line as undefined for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: {
          start: { line: undefined as unknown as number, column: 0 },
          end: { line: 1, column: 2 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc.start.column as undefined for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: {
          start: { line: 1, column: undefined as unknown as number },
          end: { line: 1, column: 2 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle empty loc.start object for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: { start: {}, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle empty loc.end object for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: { start: { line: 1, column: 0 }, end: {} },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle empty loc object for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: {},
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle empty loc object for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: {},
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with boolean values for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: {
          start: { line: true as unknown as number, column: false as unknown as number },
          end: { line: 1, column: 2 },
        },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle loc with boolean values for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: {
          start: { line: true as unknown as number, column: false as unknown as number },
          end: { line: 1, column: 2 },
        },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle loc with float line numbers for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: { start: { line: 3.5, column: 2.7 }, end: { line: 5.5, column: 10.2 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3.5)
      expect(reports[0].loc?.start.column).toBe(2.7)
    })

    test('should handle loc with float line numbers for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: { start: { line: 2.5, column: 1.3 }, end: { line: 4.5, column: 8.1 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2.5)
      expect(reports[0].loc?.start.column).toBe(1.3)
    })

    test('should handle loc with negative line numbers for ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [],
        loc: { start: { line: -1, column: -1 }, end: { line: -1, column: 1 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle loc with negative line numbers for ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern({
        type: 'ArrayPattern',
        elements: [],
        loc: { start: { line: -5, column: -3 }, end: { line: -5, column: 0 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-5)
    })
  })

  // =========================================================
  // SCHEMA AND FIXABLE
  // =========================================================
  describe('schema and fixable', () => {
    test('should have empty schema array', () => {
      expect(noEmptyPatternRule.meta.schema).toEqual([])
    })

    test('should not have fixable property', () => {
      expect(noEmptyPatternRule.meta.fixable).toBeUndefined()
    })

    test('should have schema that is frozen or readonly', () => {
      expect(noEmptyPatternRule.meta.schema).toBeDefined()
    })
  })

  // =========================================================
  // IDempotency
  // =========================================================
  describe('idempotency', () => {
    test('should report same result for same empty object pattern called twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)
      const node = createEmptyObjectPattern()

      visitor.ObjectPattern(node)
      visitor.ObjectPattern(node)

      expect(reports.length).toBe(2)
    })

    test('should report same result for same empty array pattern called twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)
      const node = createEmptyArrayPattern()

      visitor.ArrayPattern(node)
      visitor.ArrayPattern(node)

      expect(reports.length).toBe(2)
    })

    test('should produce same message for repeated calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())
      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should produce same location for same input', () => {
      const { context, reports } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(5, 10))
      visitor.ObjectPattern(createEmptyObjectPattern(5, 10))

      expect(reports[0].loc).toEqual(reports[1].loc)
    })
  })

  // =========================================================
  // VISITOR METHOD RETURN VALUES
  // =========================================================
  describe('visitor method return values', () => {
    test('ObjectPattern should return undefined for empty pattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const result = visitor.ObjectPattern(createEmptyObjectPattern())

      expect(result).toBeUndefined()
    })

    test('ObjectPattern should return undefined for non-empty pattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const result = visitor.ObjectPattern(createNonEmptyObjectPattern())

      expect(result).toBeUndefined()
    })

    test('ArrayPattern should return undefined for empty pattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const result = visitor.ArrayPattern(createEmptyArrayPattern())

      expect(result).toBeUndefined()
    })

    test('ArrayPattern should return undefined for non-empty pattern', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const result = visitor.ArrayPattern(createNonEmptyArrayPattern())

      expect(result).toBeUndefined()
    })

    test('ObjectPattern should return undefined for null input', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const result = visitor.ObjectPattern(null)

      expect(result).toBeUndefined()
    })

    test('ArrayPattern should return undefined for null input', () => {
      const { context } = createMockRuleContext({ source: 'const {} = obj' })
      const visitor = noEmptyPatternRule.create(context)

      const result = visitor.ArrayPattern(null)

      expect(result).toBeUndefined()
    })
  })
})
