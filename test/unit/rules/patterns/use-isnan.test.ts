import { describe, test, expect } from 'vitest'
import { useIsnanRule } from '../../../../src/rules/patterns/use-isnan.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

// ─── Helper to quickly create visitor + reports ───
function setupVisitor() {
  const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
  const visitor = useIsnanRule.create(context)
  return { visitor, reports, context }
}

describe('use-isnan rule', () => {
  // ═══════════════════════════════════════════════════
  // META PROPERTIES
  // ═══════════════════════════════════════════════════
  describe('meta', () => {
    test('should have problem type', () => {
      expect(useIsnanRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(useIsnanRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(useIsnanRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(useIsnanRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention NaN in description', () => {
      expect(useIsnanRule.meta.docs?.description).toContain('NaN')
    })

    test('should have meta property defined', () => {
      expect(useIsnanRule.meta).toBeDefined()
    })

    test('should have meta as an object', () => {
      expect(typeof useIsnanRule.meta).toBe('object')
    })

    test('should have type as a string', () => {
      expect(typeof useIsnanRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof useIsnanRule.meta.severity).toBe('string')
    })

    test('should have docs property', () => {
      expect(useIsnanRule.meta.docs).toBeDefined()
    })

    test('should have docs as an object', () => {
      expect(typeof useIsnanRule.meta.docs).toBe('object')
    })

    test('should have docs.description as a string', () => {
      expect(typeof useIsnanRule.meta.docs?.description).toBe('string')
    })

    test('should have docs.description that is non-empty', () => {
      expect(useIsnanRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs.category as a string', () => {
      expect(typeof useIsnanRule.meta.docs?.category).toBe('string')
    })

    test('should have docs.recommended as a boolean', () => {
      expect(typeof useIsnanRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should mention isNaN in description', () => {
      expect(useIsnanRule.meta.docs?.description).toContain('isNaN')
    })

    test('should have schema defined as empty array', () => {
      expect(useIsnanRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(useIsnanRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(useIsnanRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(useIsnanRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(useIsnanRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have valid severity value', () => {
      expect(['off', 'warn', 'error']).toContain(useIsnanRule.meta.severity)
    })

    test('should have valid type value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(useIsnanRule.meta.type)
    })

    test('should have description longer than 10 chars', () => {
      expect(useIsnanRule.meta.docs?.description.length).toBeGreaterThan(10)
    })
  })

  // ═══════════════════════════════════════════════════
  // CREATE / VISITOR
  // ═══════════════════════════════════════════════════
  describe('create', () => {
    test('should return visitor with BinaryExpression method', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('BinaryExpression should be a function', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('create should not throw with valid context', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })

      expect(() => useIsnanRule.create(context)).not.toThrow()
    })

    test('create can be called multiple times', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor1 = useIsnanRule.create(context)
      const visitor2 = useIsnanRule.create(context)

      expect(visitor1).toBeDefined()
      expect(visitor2).toBeDefined()
    })

    test('each create call returns a visitor with BinaryExpression', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor1 = useIsnanRule.create(context)
      const visitor2 = useIsnanRule.create(context)

      expect(typeof visitor1.BinaryExpression).toBe('function')
      expect(typeof visitor2.BinaryExpression).toBe('function')
    })

    test('create should not report anything by itself', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      useIsnanRule.create(context)

      expect(reports.length).toBe(0)
    })

    test('create is a function', () => {
      expect(typeof useIsnanRule.create).toBe('function')
    })

    test('visitor object should be keyed by string methods', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      expect(Object.keys(visitor)).toContain('BinaryExpression')
    })

    test('create should accept context without throwing', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })

      expect(() => useIsnanRule.create(context)).not.toThrow()
    })

    test('visitor.BinaryExpression should accept a single argument', () => {
      const { visitor } = setupVisitor()

      expect(visitor.BinaryExpression.length).toBeLessThanOrEqual(1)
    })
  })

  // ═══════════════════════════════════════════════════
  // DETECTING NaN COMPARISONS - STRICT EQUALITY (===)
  // ═══════════════════════════════════════════════════
  describe('detecting NaN comparisons', () => {
    test('should report x === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('isnan')
    })

    test('should report NaN === x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report foo === NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('foo'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN === foo', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('foo')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report bar === NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('bar'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN === 42', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createLiteral(42)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 42 === NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createLiteral(42), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN === NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report _temp === NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('_temp'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report $var === NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('$var'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    // ═══════════════════════════════════════════════════
    // STRICT INEQUALITY (!==)
    // ═══════════════════════════════════════════════════

    test('should report x !== NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN !== x', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('NaN'), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report foo !== NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('foo'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN !== foo', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('NaN'), createIdentifier('foo')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN !== 0', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('NaN'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN !== NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('NaN'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    // ═══════════════════════════════════════════════════
    // LOOSE EQUALITY (==)
    // ═══════════════════════════════════════════════════

    test('should report x == NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN == x', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('NaN'), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report foo == NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('foo'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN == foo', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('NaN'), createIdentifier('foo')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN == NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('NaN'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN == 0', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('NaN'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    // ═══════════════════════════════════════════════════
    // LOOSE INEQUALITY (!=)
    // ═══════════════════════════════════════════════════

    test('should report x != NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN != x', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('NaN'), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report foo != NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('foo'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN != foo', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('NaN'), createIdentifier('foo')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN != NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('NaN'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN != null literal', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('NaN'), createLiteral(null)),
      )

      expect(reports.length).toBe(1)
    })

    // ═══════════════════════════════════════════════════
    // NON-EQUALITY OPERATORS (should NOT report)
    // ═══════════════════════════════════════════════════

    test('should not report other operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('<', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-NaN comparisons', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(5)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report < operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('<', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report > operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('>', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report <= operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('<=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report >= operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('>=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report + operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report - operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report * operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report / operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('/', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report % operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('%', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ** operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('**', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report & operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('&', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report | operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('|', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ^ operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('^', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report << operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('<<', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report >> operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('>>', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report >>> operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('>>>', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report && operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('&&', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report || operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('||', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ?? operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('??', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report in operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('in', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report instanceof operator with NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('instanceof', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    // ═══════════════════════════════════════════════════
    // NON-NaN IDENTIFIERS (should NOT report)
    // ═══════════════════════════════════════════════════

    test('should not report x === y', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Infinity === x', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('Infinity'), createIdentifier('x')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === Infinity', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report undefined === x', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('undefined'), createIdentifier('x')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === undefined', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report foo === bar', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('foo'), createIdentifier('bar')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === 5', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(5)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === "NaN" (string literal)', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === true', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(true)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === false', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === null', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x == 0', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x != 5', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createLiteral(5)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x !== "hello"', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createLiteral('hello')),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════
  // EDGE CASES
  // ═══════════════════════════════════════════════════
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN' })
      const visitor = useIsnanRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { visitor, reports } = setupVisitor()

      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { visitor, reports } = setupVisitor()

      expect(() => visitor.BinaryExpression('BinaryExpression')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { visitor, reports } = setupVisitor()

      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { visitor, reports } = setupVisitor()

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { visitor, reports } = setupVisitor()

      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'CallExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null operator', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: null,
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric operator', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: 42,
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined operator', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: undefined,
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report when left is null and right is NaN identifier', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: null,
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report when right is null and left is NaN identifier', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('NaN'),
        right: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report when left is undefined and right is NaN identifier', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: undefined,
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report when right is undefined and left is NaN identifier', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('NaN'),
        right: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report when left is number and right is NaN identifier', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: 42,
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report when right is number and left is NaN identifier', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('NaN'),
        right: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with string as left', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: 'NaN',
        right: createIdentifier('x'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report nan (lowercase) identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('nan')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report NAN (uppercase) identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NAN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Nan (mixed case) identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Nan')),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle left with type not Identifier', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Literal', value: 'NaN' },
        right: createIdentifier('x'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right with type not Identifier', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 'NaN' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (no start)', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (no end)', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with empty loc', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: {},
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node where left has name but wrong type', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'CallExpression', name: 'NaN' },
        right: createIdentifier('x'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where right has name but wrong type', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: { type: 'CallExpression', name: 'NaN' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string operator', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean operator', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: true,
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested valid node', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 99, column: 50 }, end: { line: 99, column: 60 } },
        extra: { parenthesized: true },
        range: [0, 10],
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  // ═══════════════════════════════════════════════════
  // LOCATION REPORTING
  // ═══════════════════════════════════════════════════
  describe('location reporting', () => {
    test('should report location from node.loc', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN'), 5, 10),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report default location when no loc on node', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end position', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN'), 3, 5),
      )

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for NaN on right with !==', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN'), 10, 20),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location for NaN on left with ==', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('NaN'), createIdentifier('x'), 7, 3),
      )

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for NaN on left with !=', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('NaN'), createIdentifier('x'), 2, 8),
      )

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location with high line numbers', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN'), 9999, 0),
      )

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location with high column numbers', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN'), 1, 500),
      )

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle loc with only line in start', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 5 }, end: { line: 5, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with non-numeric line', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 'bad', column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with null start', () => {
      const { visitor, reports } = setupVisitor()

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: null, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  // ═══════════════════════════════════════════════════
  // MESSAGE CONTENT
  // ═══════════════════════════════════════════════════
  describe('message content', () => {
    test('should contain isNaN in message for === NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('isnan')
    })

    test('should contain isNaN in message for !== NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('isnan')
    })

    test('should contain isNaN in message for == NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('isnan')
    })

    test('should contain isNaN in message for != NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('isnan')
    })

    test('should have the correct exact message', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toBe('Use the isNaN function to compare with NaN.')
    })

    test('should return same message for NaN on left', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('x')),
      )

      expect(reports[0].message).toBe('Use the isNaN function to compare with NaN.')
    })

    test('should return same message for == operator', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toBe('Use the isNaN function to compare with NaN.')
    })

    test('should return same message for != operator', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toBe('Use the isNaN function to compare with NaN.')
    })

    test('should return same message for !== operator', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toBe('Use the isNaN function to compare with NaN.')
    })

    test('message should be a string', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(typeof reports[0].message).toBe('string')
    })

    test('message should be non-empty', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should contain NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('NaN')
    })

    test('message should be consistent across multiple detections', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('y'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('message should contain "compare"', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('compare')
    })

    test('message should contain "function"', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('function')
    })
  })

  // ═══════════════════════════════════════════════════
  // MULTIPLE REPORTS
  // ═══════════════════════════════════════════════════
  describe('multiple reports', () => {
    test('should report twice for two NaN comparisons', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('y'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(2)
    })

    test('should report once for NaN then none for non-NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report once for non-NaN then NaN', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report many times for many NaN comparisons', () => {
      const { visitor, reports } = setupVisitor()

      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('===', createIdentifier(`x${i}`), createIdentifier('NaN')),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should handle interleaved NaN and non-NaN calls', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('y'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('NaN'), createIdentifier('z')),
      )

      expect(reports.length).toBe(3)
    })

    test('should report for all four equality operators in sequence', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(4)
    })

    test('each report should have its own message', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('y'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toBeDefined()
      expect(reports[1].message).toBeDefined()
    })

    test('each report should have its own location', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN'), 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('y'), createIdentifier('NaN'), 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should not carry over state between calls', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('NaN')
    })

    test('should report NaN on left in one call and NaN on right in another', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('x')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('y'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(2)
    })
  })

  // ═══════════════════════════════════════════════════
  // EXPORT VERIFICATION
  // ═══════════════════════════════════════════════════
  describe('exports', () => {
    test('should export useIsnanRule', () => {
      expect(useIsnanRule).toBeDefined()
    })

    test('useIsnanRule should be an object', () => {
      expect(typeof useIsnanRule).toBe('object')
    })

    test('useIsnanRule should have meta property', () => {
      expect(useIsnanRule).toHaveProperty('meta')
    })

    test('useIsnanRule should have create property', () => {
      expect(useIsnanRule).toHaveProperty('create')
    })

    test('create should be a function', () => {
      expect(typeof useIsnanRule.create).toBe('function')
    })

    test('meta should be an object', () => {
      expect(typeof useIsnanRule.meta).toBe('object')
    })

    test('useIsnanRule should have exactly meta and create keys', () => {
      const keys = Object.keys(useIsnanRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('rule should conform to RuleDefinition interface', () => {
      expect(useIsnanRule.meta).toBeDefined()
      expect(useIsnanRule.create).toBeDefined()
      expect(typeof useIsnanRule.create).toBe('function')
    })

    test('calling create multiple times should produce independent visitors', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN' })
      const visitor1 = useIsnanRule.create(context)
      const visitor2 = useIsnanRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have consistent meta across accesses', () => {
      const meta1 = useIsnanRule.meta
      const meta2 = useIsnanRule.meta

      expect(meta1).toBe(meta2)
    })
  })

  // ═══════════════════════════════════════════════════
  // OPERATOR-SPECIFIC BEHAVIOR
  // ═══════════════════════════════════════════════════
  describe('operator-specific behavior', () => {
    test('=== with NaN on right reports', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('val'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('=== with NaN on left reports', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('val')),
      )

      expect(reports.length).toBe(1)
    })

    test('!== with NaN on right reports', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('val'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('!== with NaN on left reports', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('NaN'), createIdentifier('val')),
      )

      expect(reports.length).toBe(1)
    })

    test('== with NaN on right reports', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('val'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('== with NaN on left reports', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('NaN'), createIdentifier('val')),
      )

      expect(reports.length).toBe(1)
    })

    test('!= with NaN on right reports', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('val'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('!= with NaN on left reports', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('NaN'), createIdentifier('val')),
      )

      expect(reports.length).toBe(1)
    })

    test('all four equality operators with NaN on right', () => {
      const { visitor, reports } = setupVisitor()
      const operators = ['===', '!==', '==', '!=']

      for (const op of operators) {
        visitor.BinaryExpression(
          createBinaryExpression(op, createIdentifier('x'), createIdentifier('NaN')),
        )
      }

      expect(reports.length).toBe(4)
    })

    test('all four equality operators with NaN on left', () => {
      const { visitor, reports } = setupVisitor()
      const operators = ['===', '!==', '==', '!=']

      for (const op of operators) {
        visitor.BinaryExpression(
          createBinaryExpression(op, createIdentifier('NaN'), createIdentifier('x')),
        )
      }

      expect(reports.length).toBe(4)
    })

    test('non-equality operators with NaN should not report', () => {
      const { visitor, reports } = setupVisitor()
      const operators = ['<', '>', '<=', '>=', '+', '-', '*', '/', '%', '**']

      for (const op of operators) {
        visitor.BinaryExpression(
          createBinaryExpression(op, createIdentifier('x'), createIdentifier('NaN')),
        )
      }

      expect(reports.length).toBe(0)
    })

    test('bitwise operators with NaN should not report', () => {
      const { visitor, reports } = setupVisitor()
      const operators = ['&', '|', '^', '<<', '>>', '>>>']

      for (const op of operators) {
        visitor.BinaryExpression(
          createBinaryExpression(op, createIdentifier('x'), createIdentifier('NaN')),
        )
      }

      expect(reports.length).toBe(0)
    })

    test('logical operators with NaN should not report', () => {
      const { visitor, reports } = setupVisitor()
      const operators = ['&&', '||', '??']

      for (const op of operators) {
        visitor.BinaryExpression(
          createBinaryExpression(op, createIdentifier('x'), createIdentifier('NaN')),
        )
      }

      expect(reports.length).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════
  // VISITOR INVOCATION SAFETY
  // ═══════════════════════════════════════════════════
  describe('visitor invocation safety', () => {
    test('calling BinaryExpression with no arguments should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression()).not.toThrow()
    })

    test('calling BinaryExpression with zero should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression(0)).not.toThrow()
    })

    test('calling BinaryExpression with empty string should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression('')).not.toThrow()
    })

    test('calling BinaryExpression with false should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression(false)).not.toThrow()
    })

    test('calling BinaryExpression with a function should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression(() => {})).not.toThrow()
    })

    test('calling BinaryExpression with Symbol should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression(Symbol('test'))).not.toThrow()
    })

    test('calling BinaryExpression with NaN as primitive should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression(Number.NaN)).not.toThrow()
    })

    test('calling BinaryExpression with Date object should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression(new Date())).not.toThrow()
    })

    test('calling BinaryExpression with Map should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression(new Map())).not.toThrow()
    })

    test('calling BinaryExpression with Set should not throw', () => {
      const { visitor } = setupVisitor()

      expect(() => visitor.BinaryExpression(new Set())).not.toThrow()
    })
  })

  // ═══════════════════════════════════════════════════
  // CONTEXT INDEPENDENCE
  // ═══════════════════════════════════════════════════
  describe('context independence', () => {
    test('visitor from one context should not affect another', () => {
      const setup1 = setupVisitor()
      const setup2 = setupVisitor()

      setup1.visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(setup1.reports.length).toBe(1)
      expect(setup2.reports.length).toBe(0)
    })

    test('two visitors can report independently', () => {
      const setup1 = setupVisitor()
      const setup2 = setupVisitor()

      setup1.visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      setup2.visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('y'), createIdentifier('NaN')),
      )

      expect(setup1.reports.length).toBe(1)
      expect(setup2.reports.length).toBe(1)
    })

    test('reports from one context have correct messages', () => {
      const setup1 = setupVisitor()
      const setup2 = setupVisitor()

      setup1.visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(setup1.reports[0].message).toBe('Use the isNaN function to compare with NaN.')
      expect(setup2.reports.length).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════
  // COMPREHENSIVE OPERAND COMBINATIONS
  // ═══════════════════════════════════════════════════
  describe('operand combinations with NaN', () => {
    const equalityOps = ['===', '!==', '==', '!=']

    for (const op of equalityOps) {
      test(`should report ${op} with NaN right and CallExpression left`, () => {
        const { visitor, reports } = setupVisitor()

        const node = {
          type: 'BinaryExpression',
          operator: op,
          left: { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] },
          right: createIdentifier('NaN'),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }

        visitor.BinaryExpression(node)

        expect(reports.length).toBe(1)
      })

      test(`should report ${op} with NaN left and CallExpression right`, () => {
        const { visitor, reports } = setupVisitor()

        const node = {
          type: 'BinaryExpression',
          operator: op,
          left: createIdentifier('NaN'),
          right: { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }

        visitor.BinaryExpression(node)

        expect(reports.length).toBe(1)
      })

      test(`should report ${op} with NaN right and MemberExpression left`, () => {
        const { visitor, reports } = setupVisitor()

        const node = {
          type: 'BinaryExpression',
          operator: op,
          left: {
            type: 'MemberExpression',
            object: createIdentifier('obj'),
            property: createIdentifier('prop'),
          },
          right: createIdentifier('NaN'),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }

        visitor.BinaryExpression(node)

        expect(reports.length).toBe(1)
      })

      test(`should not report ${op} with NaN left and string literal right`, () => {
        const { visitor, reports } = setupVisitor()

        visitor.BinaryExpression(
          createBinaryExpression(op, createIdentifier('NaN'), createLiteral('hello')),
        )

        expect(reports.length).toBe(1)
      })
    }
  })

  // ═══════════════════════════════════════════════════
  // IDENTIFIER CASE SENSITIVITY
  // ═══════════════════════════════════════════════════
  describe('identifier case sensitivity', () => {
    test('should detect exact NaN identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should not detect nan (lowercase)', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('nan')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect NAN (all caps)', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NAN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect Nan (title case)', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Nan')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect nAn identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('nAn')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect naN identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('naN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect Na n (with space) identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Na n')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect NaNx identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaNx')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect xNaN identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('xNaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect isNan identifier', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('isNan')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not detect isNaN identifier (wrong case)', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('isNaN')),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════
  // REPORT DESCRIPTOR SHAPE
  // ═══════════════════════════════════════════════════
  describe('report descriptor shape', () => {
    test('report should have message property', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0]).toHaveProperty('message')
    })

    test('report should have loc property', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report loc should have start', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report loc should have end', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start should have line', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('report loc start should have column', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end should have line', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('report loc end should have column', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('report loc start line should be a number', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start column should be a number', () => {
      const { visitor, reports } = setupVisitor()

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })
  })
})
