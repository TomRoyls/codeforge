import { describe, test, expect } from 'vitest'
import { noConstantBinaryExpressionRule } from '../../../../src/rules/patterns/no-constant-binary-expression.js'
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

function createRegExpLiteral(line = 1, column = 0): unknown {
  return {
    type: 'RegExpLiteral',
    regex: { pattern: 'test', flags: '' },
    loc: {
      start: { line, column },
      end: { line, column: column + 8 },
    },
  }
}

function createBinaryExpression(
  left: unknown,
  right: unknown,
  operator: string,
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

function createLogicalExpression(
  left: unknown,
  right: unknown,
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-constant-binary-expression rule', () => {
  // =====================================================
  // META TESTS (20)
  // =====================================================
  describe('meta', () => {
    test('should have meta property', () => {
      expect(noConstantBinaryExpressionRule.meta).toBeDefined()
    })

    test('should have problem type', () => {
      expect(noConstantBinaryExpressionRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noConstantBinaryExpressionRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention expressions in description', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.description.toLowerCase()).toContain(
        'expression',
      )
    })

    test('should have a non-empty description', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs property defined', () => {
      expect(noConstantBinaryExpressionRule.meta.docs).toBeDefined()
    })

    test('should have type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(
        noConstantBinaryExpressionRule.meta.type,
      )
    })

    test('should have severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(noConstantBinaryExpressionRule.meta.severity)
    })

    test('should have undefined fixable property', () => {
      expect(noConstantBinaryExpressionRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noConstantBinaryExpressionRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noConstantBinaryExpressionRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noConstantBinaryExpressionRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have schema as empty array', () => {
      expect(noConstantBinaryExpressionRule.meta.schema).toEqual([])
    })

    test('should have description mentioning operation or value', () => {
      const desc = noConstantBinaryExpressionRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/operation|value|constant|affect/)
    })

    test('should have create method', () => {
      expect(typeof noConstantBinaryExpressionRule.create).toBe('function')
    })

    test('should be a valid RuleDefinition object', () => {
      expect(noConstantBinaryExpressionRule).toHaveProperty('meta')
      expect(noConstantBinaryExpressionRule).toHaveProperty('create')
    })

    test('should have meta.type as string', () => {
      expect(typeof noConstantBinaryExpressionRule.meta.type).toBe('string')
    })

    test('should have meta.severity as string', () => {
      expect(typeof noConstantBinaryExpressionRule.meta.severity).toBe('string')
    })
  })

  // =====================================================
  // CREATE / VISITOR TESTS (8)
  // =====================================================
  describe('create', () => {
    test('should return visitor with BinaryExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return visitor with LogicalExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
    })

    test('BinaryExpression should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('LogicalExpression should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(typeof visitor.LogicalExpression).toBe('function')
    })

    test('should return exactly two visitor methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('should return a new visitor object on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noConstantBinaryExpressionRule.create(context)
      const visitor2 = noConstantBinaryExpressionRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor methods should not throw when called with no arguments', () => {
      const { context } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression()).not.toThrow()
      expect(() => visitor.LogicalExpression()).not.toThrow()
    })

    test('create should accept context and return RuleVisitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })
  })

  // =====================================================
  // DETECTION TESTS (30) - cases that SHOULD report
  // =====================================================
  describe('detection - BinaryExpression', () => {
    test('should report binary expression with || and truthy number left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report binary expression with || and truthy string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral('text'), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with || and true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(true), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with ?? and non-null literal left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with ?? and non-undefined literal left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral('text'), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with && and null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with && and false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with || and large truthy number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(999), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with ?? and false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with ?? and 0 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with || and RegExpLiteral left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createRegExpLiteral(), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with ?? and RegExpLiteral left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createRegExpLiteral(), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with && and undefined left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(undefined), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with || and positive float left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(3.14), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with ?? and truthy string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detection - LogicalExpression', () => {
    test('should report logical expression with || and truthy left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report logical expression with ?? and non-null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with && and false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(false), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with && and null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(null), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with || and true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(true), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with || and truthy string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral('yes'), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with ?? and string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral('val'), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with ?? and 0 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(0), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with || and RegExpLiteral left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createRegExpLiteral(), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with ?? and RegExpLiteral left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createRegExpLiteral(), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with && and undefined left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(undefined), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with ?? and false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(false), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with && and empty string left as NOT useless', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      // '' is falsy but specifically excluded: l.value !== ''
      const node = createLogicalExpression(createLiteral(''), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report logical expression with && and 0 left as NOT useless', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      // 0 is falsy but specifically excluded: l.value !== 0
      const node = createLogicalExpression(createLiteral(0), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report logical expression with || and number left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(42), createIdentifier('y'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // NOT REPORTING TESTS (30) - cases that should NOT report
  // =====================================================
  describe('valid cases - BinaryExpression', () => {
    test('should not report regular binary expression with identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '+')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with non-constant left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createLiteral(1), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with || and falsy left (0)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with || and falsy left (empty string)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(''), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with || and falsy left (false)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with && and truthy number left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with && and truthy string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with ?? and null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with ?? and undefined left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(undefined), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with operators other than ||, &&, ??', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '+')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with - operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '-')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with * operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '*')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with / operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '/')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with === operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '===')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with !== operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '!==')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with > operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '>')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with < operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '<')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with && and 0 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with && and empty string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(''), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with && and true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(true), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with || and null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with || and undefined left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(undefined), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - LogicalExpression', () => {
    test('should not report logical expression with non-constant left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createIdentifier('x'), createLiteral(1), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with || and falsy number left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(0), createIdentifier('y'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with ?? and null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(null), createIdentifier('y'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with && and truthy left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(true), createIdentifier('y'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with ?? and undefined left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(undefined), createIdentifier('y'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with || and false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(false), createIdentifier('y'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with || and empty string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(''), createIdentifier('y'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with && and non-zero number left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(5), createIdentifier('y'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with && and non-empty string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral('hi'), createIdentifier('y'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EDGE CASES (25)
  // =====================================================
  describe('edge cases', () => {
    test('should handle null BinaryExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined BinaryExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null LogicalExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined LogicalExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        right: createIdentifier('x'),
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without operator property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral(1),
        right: createIdentifier('x'),
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle left that is not a literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: createIdentifier('x'),
        right: createLiteral(1),
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      delete (node as Record<string, unknown>).loc

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle object that is not a valid AST node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = { type: 'BinaryExpression' }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle wrong node type for BinaryExpression visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: createLiteral(1),
        right: createIdentifier('x'),
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle wrong node type for LogicalExpression visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: createLiteral(1),
        right: createIdentifier('x'),
      }
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression('string' as unknown)
      visitor.LogicalExpression(123 as unknown)

      expect(reports.length).toBe(0)
    })

    test('should handle 0 in && expression (should not report)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty string in && expression (should not report)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(''), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle array as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression([] as unknown)
      visitor.LogicalExpression([] as unknown)

      expect(reports.length).toBe(0)
    })

    test('should handle numeric node value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(42 as unknown)
      visitor.LogicalExpression(42 as unknown)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(true as unknown)
      visitor.LogicalExpression(false as unknown)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression({})
      visitor.LogicalExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc but missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: createLiteral(1),
        right: createIdentifier('x'),
        loc: {},
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle node with partial loc (start only)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: createLiteral(1),
        right: createIdentifier('x'),
        loc: { start: { line: 5, column: 3 } },
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle NaN literal value in || expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      // NaN is falsy, so || should NOT report
      const node = createBinaryExpression(createLiteral(NaN), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN literal value in && expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      // NaN: !NaN is true, NaN !== 0 is true, NaN !== '' is true → should report
      const node = createBinaryExpression(createLiteral(NaN), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle NaN literal value in ?? expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      // NaN !== null and NaN !== undefined → should report
      const node = createBinaryExpression(createLiteral(NaN), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with right as literal (should not affect result)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createLiteral(2), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested node structures', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const innerExpr = createBinaryExpression(createLiteral(1), createIdentifier('y'), '||')
      const node = createBinaryExpression(createLiteral(5), innerExpr, '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // LOCATION TESTS (15)
  // =====================================================
  describe('location', () => {
    test('should report binary expression with correct location (line 10, col 5)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 10, 5)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with line 1 col 0 by default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for logical expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(true), createIdentifier('x'), '||', 20, 8)
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 5, 2)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report location for multiple nodes correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 3, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(2), createIdentifier('y'), '||', 7, 4),
      )

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(7)
      expect(reports[1].loc?.start.column).toBe(4)
    })

    test('should handle high line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 9999, 0)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle high column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 1, 500)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle zero line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 0, 0)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for LogicalExpression without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '||')
      delete (node as Record<string, unknown>).loc

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should preserve both start and end location objects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 4, 10)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start).toEqual({ line: 4, column: 10 })
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle location for && expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '&&', 15, 3)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle location for ?? expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral('x'), createIdentifier('y'), '??', 25, 7)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: createLiteral(1),
        right: createIdentifier('x'),
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for LogicalExpression at various positions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(null), createIdentifier('x'), '&&', 42, 10)
      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle loc with non-numeric values gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: createLiteral(1),
        right: createIdentifier('x'),
        loc: { start: { line: 'abc' as unknown, column: null as unknown }, end: {} },
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      // extractLocation falls back to defaults for non-numeric values
    })
  })

  // =====================================================
  // MESSAGE TESTS (10)
  // =====================================================
  describe('messages', () => {
    test('should contain "reduces to the left operand" for BinaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should contain "reduces to the left operand" for LogicalExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)

      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should include "no effect" in message for || expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(true), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('no effect')
    })

    test('should include "no effect" in message for && expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('no effect')
    })

    test('should include "no effect" in message for ?? expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('no effect')
    })

    test('should have consistent message across all operators', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('a'), '||'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('b'), '&&'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('x'), createIdentifier('c'), '??'),
      )

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should have message of type string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should include "Expression" in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Expression')
    })

    test('should have same message for BinaryExpression and LogicalExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||'),
      )
      visitor.LogicalExpression(
        createLogicalExpression(createLiteral(1), createIdentifier('x'), '||'),
      )

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // =====================================================
  // MULTIPLE REPORTS (10)
  // =====================================================
  describe('multiple reports', () => {
    test('should report each violation separately with 3 nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(2), createIdentifier('y'), '||'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(3), createIdentifier('z'), '||'),
      )

      expect(reports.length).toBe(3)
    })

    test('should report mixed BinaryExpression and LogicalExpression violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||'),
      )
      visitor.LogicalExpression(
        createLogicalExpression(createLiteral(true), createIdentifier('y'), '||'),
      )

      expect(reports.length).toBe(2)
    })

    test('should report only violating nodes and skip valid ones', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '||'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(2), createIdentifier('y'), '||'),
      )

      expect(reports.length).toBe(2)
    })

    test('should report 5 separate violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createLiteral(i + 1), createIdentifier(`x${i}`), '||'),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should report violations for all three operators', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('a'), '||'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('b'), '&&'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('x'), createIdentifier('c'), '??'),
      )

      expect(reports.length).toBe(3)
    })

    test('should report violations interleaved with valid expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      // valid
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '||'),
      )
      // invalid
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('c'), '||'),
      )
      // valid
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('d'), '||'),
      )
      // invalid
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('e'), '&&'),
      )

      expect(reports.length).toBe(2)
    })

    test('should report large number of violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createLiteral(1), createIdentifier(`x${i}`), '||'),
        )
      }

      expect(reports.length).toBe(20)
    })

    test('should report all LogicalExpression violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.LogicalExpression(
          createLogicalExpression(createLiteral(true), createIdentifier(`x${i}`), '||'),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should report each node with its own distinct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(2), createIdentifier('y'), '||', 2, 5),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(3), createIdentifier('z'), '||', 3, 10),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should not report any violations when all expressions are valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '||'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '&&'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('e'), createIdentifier('f'), '??'),
      )

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // CONTEXT TESTS (10)
  // =====================================================
  describe('context', () => {
    test('should use provided context for reporting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not throw when context report is called multiple times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      for (let i = 0; i < 10; i++) {
        const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(10)
    })

    test('should work with fresh context for each visitor', () => {
      const ctx1 = createMockRuleContext()
      const visitor1 = noConstantBinaryExpressionRule.create(ctx1.context)

      const ctx2 = createMockRuleContext()
      const visitor2 = noConstantBinaryExpressionRule.create(ctx2.context)

      visitor1.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||'),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createLiteral(2), createIdentifier('y'), '||'),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createLiteral(3), createIdentifier('z'), '||'),
      )

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(2)
    })

    test('should not affect other visitors sharing same context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor1 = noConstantBinaryExpressionRule.create(context)
      const visitor2 = noConstantBinaryExpressionRule.create(context)

      visitor1.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||'),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createLiteral(2), createIdentifier('y'), '||'),
      )

      expect(reports.length).toBe(2)
    })

    test('should correctly isolate BinaryExpression and LogicalExpression on same context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('x'), '||'),
      )
      visitor.LogicalExpression(
        createLogicalExpression(createLiteral(true), createIdentifier('y'), '||'),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle context with empty reports array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(reports.length).toBe(0)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '+'),
      )

      expect(reports.length).toBe(0)
    })

    test('should use context workspaceRoot correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      // Workspace root is available but rule doesn't use it directly
      expect(context.workspaceRoot).toBe('/src')

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should use context getFilePath', () => {
      const { context } = createMockRuleContext()

      expect(context.getFilePath()).toBe('/src/file.ts')
    })

    test('should use context getSource', () => {
      const { context } = createMockRuleContext({ source: 'true || x' })

      expect(context.getSource()).toBe('true || x')
    })

    test('should work when context logger methods are available', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(context.logger.debug).toBeDefined()
      expect(context.logger.info).toBeDefined()
      expect(context.logger.warn).toBeDefined()
      expect(context.logger.error).toBeDefined()

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // EXPANDED: BinaryExpression || detection
  // =====================================================
  describe('expanded: BinaryExpression || detection', () => {
    test('should report BinaryExpression with || and truthy number 1 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with || and truthy number 42 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(42), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with || and truthy number -1 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(-1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with || and truthy number 3.14 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(3.14), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with || and boolean true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(true), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with || and non-empty string hello left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with || and single char string a left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with || and non-empty string "false" left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral('false'), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // EXPANDED: BinaryExpression || valid cases
  // =====================================================
  describe('expanded: BinaryExpression || valid cases', () => {
    test('should NOT report BinaryExpression with || and falsy number 0 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with || and boolean false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with || and empty string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(''), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with || and null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(null), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with || and undefined left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(undefined), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EXPANDED: BinaryExpression ?? detection
  // =====================================================
  describe('expanded: BinaryExpression ?? detection', () => {
    test('should report BinaryExpression with ?? and falsy number 0 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with ?? and truthy number 1 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with ?? and boolean false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with ?? and boolean true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(true), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with ?? and empty string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(''), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with ?? and non-empty string hello left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // EXPANDED: BinaryExpression ?? valid cases
  // =====================================================
  describe('expanded: BinaryExpression ?? valid cases', () => {
    test('should NOT report BinaryExpression with ?? and null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(null), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with ?? and undefined left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(undefined), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EXPANDED: BinaryExpression && detection
  // =====================================================
  describe('expanded: BinaryExpression && detection', () => {
    test('should report BinaryExpression with && and boolean false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with && and null left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(null), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with && and undefined left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(undefined), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // EXPANDED: BinaryExpression && valid cases
  // =====================================================
  describe('expanded: BinaryExpression && valid cases', () => {
    test('should NOT report BinaryExpression with && and truthy number 1 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with && and boolean true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(true), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with && and non-empty string hello left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with && and falsy number 0 (exempted) left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report BinaryExpression with && and empty string (exempted) left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(''), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EXPANDED: non-logical operators
  // =====================================================
  describe('expanded: non-logical operators', () => {
    test('should not report BinaryExpression with addition (+) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '+')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with subtraction (-) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '-')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with multiplication (*) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '*')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with division (/) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '/')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with modulo (%) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '%')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with exponentiation (**) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '**')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with loose equality (==) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '==')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with loose inequality (!=) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '!=')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with strict equality (===) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '===')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with strict inequality (!==) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '!==')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with less than (<) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '<')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with greater than (>) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '>')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with less than or equal (<=) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '<=')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with greater than or equal (>=) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '>=')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with bitwise AND (&) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with bitwise OR (|) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '|')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with bitwise XOR (^) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '^')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with left shift (<<) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '<<')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with right shift (>>) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '>>')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with unsigned right shift (>>>) operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '>>>')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with in operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), 'in')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with instanceof operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), 'instanceof')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EXPANDED: LogicalExpression || detection
  // =====================================================
  describe('expanded: LogicalExpression || detection', () => {
    test('should report LogicalExpression with || and truthy number 1 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression with || and truthy number 42 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(42), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression with || and boolean true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(true), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression with || and non-empty string yes left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral('yes'), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // EXPANDED: LogicalExpression && valid cases
  // =====================================================
  describe('expanded: LogicalExpression && valid cases', () => {
    test('should NOT report LogicalExpression with && and truthy number 1 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report LogicalExpression with && and boolean true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(true), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report LogicalExpression with && and non-empty string hello left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral('hello'), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report LogicalExpression with && and falsy number 0 (exempted) left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(0), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should NOT report LogicalExpression with && and empty string (exempted) left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(''), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EXPANDED: LogicalExpression ?? detection
  // =====================================================
  describe('expanded: LogicalExpression ?? detection', () => {
    test('should report LogicalExpression with ?? and falsy number 0 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(0), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression with ?? and truthy number 1 left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression with ?? and boolean false left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(false), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression with ?? and boolean true left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(true), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression with ?? and empty string left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral(''), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression with ?? and non-empty string x left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createLogicalExpression(createLiteral('x'), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // EXPANDED: RegExpLiteral detection
  // =====================================================
  describe('expanded: RegExpLiteral detection', () => {
    test('should report BinaryExpression with RegExpLiteral and || operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: createRegExpLiteral(),
        right: createIdentifier('x'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report BinaryExpression with RegExpLiteral and ?? operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '??',
        left: createRegExpLiteral(),
        right: createIdentifier('x'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report BinaryExpression with RegExpLiteral and && operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = createBinaryExpression(createRegExpLiteral(), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
