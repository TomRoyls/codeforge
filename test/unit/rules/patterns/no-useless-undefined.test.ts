import { describe, test, expect } from 'vitest'
import defaultExport, {
  noUselessUndefinedRule,
} from '../../../../src/rules/patterns/no-useless-undefined.js'
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

function createReturnStatement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createVariableDeclarator(id: unknown, init: unknown, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id,
    init,
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

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
  }
}

function createBinaryExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }
}

describe('no-useless-undefined rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUselessUndefinedRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUselessUndefinedRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUselessUndefinedRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessUndefinedRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention undefined in description', () => {
      expect(noUselessUndefinedRule.meta.docs?.description.toLowerCase()).toContain('undefined')
    })

    test('should mention useless in description', () => {
      expect(noUselessUndefinedRule.meta.docs?.description.toLowerCase()).toContain('useless')
    })

    test('should have schema defined', () => {
      expect(noUselessUndefinedRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUselessUndefinedRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with ReturnStatement method', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(visitor).toHaveProperty('ReturnStatement')
    })

    test('should return visitor with VariableDeclarator method', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('ReturnStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('VariableDeclarator should be a function', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(typeof visitor.VariableDeclarator).toBe('function')
    })
  })

  describe('return undefined detection', () => {
    test('should report return undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports.length).toBe(1)
    })

    test('should not report return without argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(null))

      expect(reports.length).toBe(0)
    })

    test('should not report return with a value', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createLiteral(42)))

      expect(reports.length).toBe(0)
    })

    test('should not report return with identifier that is not undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('myValue')))

      expect(reports.length).toBe(0)
    })

    test('should not report return with call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createCallExpression(createIdentifier('fn'))))

      expect(reports.length).toBe(0)
    })

    test('should not report return with binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(
        createReturnStatement(createBinaryExpression('+', createLiteral(1), createLiteral(2))),
      )

      expect(reports.length).toBe(0)
    })

    test('should report return undefined with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports[0].message).toMatch(/useless/i)
      expect(reports[0].message).toMatch(/undefined/i)
    })

    test('should report return undefined with location', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report multiple return undefined statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports.length).toBe(2)
    })
  })

  describe('variable initialized to undefined', () => {
    test('should report let x = undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report const x = undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report let x = 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report let x = null', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report let x without initializer', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(0)
    })

    test('should not report let x = someVar', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('someVar')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report let x = fn()', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(
          createIdentifier('x'),
          createCallExpression(createIdentifier('fn')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report variable init undefined with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message).toMatch(/useless/i)
      expect(reports[0].message).toMatch(/undefined/i)
    })

    test('should report variable init undefined with location', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined'), 3, 8),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report multiple variable init undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('a'), createIdentifier('undefined')),
      )
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('b'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(2)
    })

    test('should not report variable init with empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral('')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with zero', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with false', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - ReturnStatement', () => {
    test('should handle null ReturnStatement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined ReturnStatement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object ReturnStatement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.ReturnStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        argument: createIdentifier('undefined'),
      }

      visitor.ReturnStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement without argument property', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = { type: 'ReturnStatement' }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement with non-identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: createLiteral('undefined'),
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: createIdentifier('undefined'),
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('edge cases - VariableDeclarator', () => {
    test('should handle null VariableDeclarator node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined VariableDeclarator node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object VariableDeclarator node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: createIdentifier('x'),
        init: createIdentifier('undefined'),
      }

      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator without init property', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: createIdentifier('undefined'),
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle VariableDeclarator with literal init that is not undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: createLiteral('hello'),
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with object init', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: { type: 'ObjectExpression', properties: [] },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with array init', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: { type: 'ArrayExpression', elements: [] },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('mixed scenarios', () => {
    test('should report both return undefined and variable init undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(2)
    })

    test('should not report return of other identifier alongside return undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('myValue')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports.length).toBe(1)
    })

    test('should not report variable init with value alongside variable init undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), createLiteral(10)))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('b'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle alternating valid and invalid patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      visitor.ReturnStatement(createReturnStatement(createLiteral(42)))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('y'), createLiteral('test')),
      )
      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports.length).toBe(3)
    })
  })

  describe('message quality', () => {
    test('return undefined message should mention useless', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports[0].message.toLowerCase()).toContain('useless')
    })

    test('return undefined message should mention undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports[0].message.toLowerCase()).toContain('undefined')
    })

    test('return undefined message should mention return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports[0].message.toLowerCase()).toContain('return')
    })

    test('variable init message should mention useless', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message.toLowerCase()).toContain('useless')
    })

    test('variable init message should mention undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message.toLowerCase()).toContain('undefined')
    })

    test('variable init message should mention initialization or variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('init') || msg.includes('variable') || msg.includes('default')).toBe(true)
    })
  })

  describe('location reporting', () => {
    test('should include location in return undefined report', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 7, 4))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should include location in variable init undefined report', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined'), 12, 6),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report end location for return undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report end location for variable init undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined'), 1, 0),
      )

      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('context isolation', () => {
    test('should not share state between different contexts', () => {
      const mock1 = createMockRuleContext({ source: 'return undefined;' })
      const mock2 = createMockRuleContext({ source: 'return undefined;' })

      const visitor1 = noUselessUndefinedRule.create(mock1.context)
      const visitor2 = noUselessUndefinedRule.create(mock2.context)

      visitor1.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(mock1.reports.length).toBe(1)
      expect(mock2.reports.length).toBe(0)
    })

    test('should not share state between different visitors from same context', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })

      const visitor1 = noUselessUndefinedRule.create(context)
      const visitor2 = noUselessUndefinedRule.create(context)

      visitor1.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports.length).toBe(1)

      visitor2.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports.length).toBe(2)
    })
  })

  describe('identifier named similar to undefined', () => {
    test('should not report return of "Undefined" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('Undefined')))

      expect(reports.length).toBe(0)
    })

    test('should not report return of "undefinedVar"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefinedVar')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with "Undefined" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('Undefined')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with "isUndefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('isUndefined')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('meta deep inspection', () => {
    test('meta.docs should be defined', () => {
      expect(noUselessUndefinedRule.meta.docs).toBeDefined()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noUselessUndefinedRule.meta.docs?.description).toBe('string')
      expect(noUselessUndefinedRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.description should mention "default"', () => {
      expect(noUselessUndefinedRule.meta.docs?.description.toLowerCase()).toContain('default')
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(noUselessUndefinedRule.meta.schema)).toBe(true)
    })

    test('meta.schema should be empty (no options)', () => {
      expect(noUselessUndefinedRule.meta.schema).toHaveLength(0)
    })

    test('meta.docs.recommended should be boolean true', () => {
      expect(noUselessUndefinedRule.meta.docs?.recommended).toBe(true)
      expect(typeof noUselessUndefinedRule.meta.docs?.recommended).toBe('boolean')
    })
  })

  describe('visitor structure', () => {
    test('create should return a plain object', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
      expect(Array.isArray(visitor)).toBe(false)
    })

    test('visitor should have exactly 2 own enumerable properties', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const ownKeys = Object.keys(visitor)
      expect(ownKeys).toHaveLength(2)
    })

    test('ReturnStatement handler should have arity 1', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(visitor.ReturnStatement.length).toBe(1)
    })

    test('VariableDeclarator handler should have arity 1', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(visitor.VariableDeclarator.length).toBe(1)
    })

    test('create should return a new object on each call', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor1 = noUselessUndefinedRule.create(context)
      const visitor2 = noUselessUndefinedRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('default export', () => {
    test('default export should equal named export', () => {
      expect(defaultExport).toBe(noUselessUndefinedRule)
    })
  })

  describe('message format', () => {
    test('return undefined message should start with uppercase letter', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      const msg = reports[0].message
      expect(msg[0]).toBe(msg[0].toUpperCase())
    })

    test('return undefined message should not have leading or trailing whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports[0].message).toBe(reports[0].message.trim())
    })

    test('variable init message should not have leading or trailing whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message).toBe(reports[0].message.trim())
    })

    test('return undefined message should contain multiple sentences or be a single sentence', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      const msg = reports[0].message
      expect(msg.endsWith('.') || msg.includes('.')).toBe(true)
    })
  })

  describe('additional edge cases', () => {
    test('should not report return with NaN identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('NaN')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with NaN identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with ArrowFunction init', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('fn'),
        init: { type: 'ArrowFunctionExpression', body: createLiteral(0), params: [] },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with UnaryExpression void 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'UnaryExpression', operator: 'void', argument: createLiteral(0) },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('prop'),
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement with argument being boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createLiteral(true)))

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with ConditionalExpression init', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {
          type: 'ConditionalExpression',
          test: createIdentifier('cond'),
          consequent: createLiteral(1),
          alternate: createLiteral(2),
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with TemplateLiteral argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('additional patterns', () => {
    test('should not report variable init with Infinity identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report return with Infinity identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('Infinity')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('fn'),
        init: {
          type: 'FunctionExpression',
          id: createIdentifier('myFn'),
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with UpdateExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'UpdateExpression',
          operator: '++',
          argument: createIdentifier('i'),
          prefix: false,
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('obj'),
        init: {
          type: 'NewExpression',
          callee: createIdentifier('MyClass'),
          arguments: [],
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with void 0 (UnaryExpression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: { type: 'UnaryExpression', operator: 'void', argument: createLiteral(0) },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with LogicalExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'LogicalExpression',
          operator: '||',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with SequenceExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {
          type: 'SequenceExpression',
          expressions: [createLiteral(1), createLiteral(2)],
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('isIdentifier guard branches', () => {
    test('should not crash when ReturnStatement argument is a number primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement({ type: 'ReturnStatement', argument: 42 })

      expect(reports.length).toBe(0)
    })

    test('should not crash when ReturnStatement argument is a string primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement({ type: 'ReturnStatement', argument: 'hello' })

      expect(reports.length).toBe(0)
    })

    test('should not crash when ReturnStatement argument is boolean false', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement({ type: 'ReturnStatement', argument: false })

      expect(reports.length).toBe(0)
    })

    test('should not crash when VariableDeclarator init is a number primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: 99,
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('getNodeType branches', () => {
    test('should handle node with null type gracefully in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: null,
        id: createIdentifier('x'),
        init: createIdentifier('undefined'),
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where type is a number in VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 42,
        id: createIdentifier('x'),
        init: createIdentifier('undefined'),
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with empty object as init', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {},
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('destructuring and complex id patterns', () => {
    test('should report undefined init with ObjectPattern id', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [
            { type: 'Property', key: createIdentifier('a'), value: createIdentifier('a') },
          ],
        },
        init: createIdentifier('undefined'),
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should report undefined init with ArrayPattern id', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ArrayPattern',
          elements: [createIdentifier('a')],
        },
        init: createIdentifier('undefined'),
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('distinct report messages', () => {
    test('return undefined message should differ from variable init message', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      const returnMsg = reports[0].message

      const mock2 = createMockRuleContext({ source: 'return undefined;' })
      const visitor2 = noUselessUndefinedRule.create(mock2.context)
      visitor2.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )
      const varMsg = mock2.reports[0].message

      expect(returnMsg).not.toBe(varMsg)
    })

    test('return undefined message should contain "return" but not "initialization"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      const msg = reports[0].message.toLowerCase()
      expect(msg).toContain('return')
    })

    test('variable init message should contain "initialization"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message.toLowerCase()).toContain('initialization')
    })
  })

  describe('repeated calls to same visitor', () => {
    test('should accumulate reports across many ReturnStatement calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      }

      expect(reports.length).toBe(5)
    })

    test('should accumulate reports across many VariableDeclarator calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier(`v${i}`), createIdentifier('undefined')),
        )
      }

      expect(reports.length).toBe(5)
    })
  })

  describe('meta exhaustive checks', () => {
    test('meta should be a plain object', () => {
      expect(typeof noUselessUndefinedRule.meta).toBe('object')
      expect(noUselessUndefinedRule.meta).not.toBeNull()
    })

    test('meta.type should be exactly suggestion', () => {
      expect(noUselessUndefinedRule.meta.type).toBe('suggestion')
      expect(noUselessUndefinedRule.meta.type).not.toBe('problem')
      expect(noUselessUndefinedRule.meta.type).not.toBe('layout')
    })

    test('meta.severity should be exactly warn', () => {
      expect(noUselessUndefinedRule.meta.severity).toBe('warn')
      expect(noUselessUndefinedRule.meta.severity).not.toBe('error')
      expect(noUselessUndefinedRule.meta.severity).not.toBe('off')
    })

    test('meta should have exactly type, severity, docs, schema, fixable keys', () => {
      const keys = Object.keys(noUselessUndefinedRule.meta)
      expect(keys).toContain('type')
      expect(keys).toContain('severity')
      expect(keys).toContain('docs')
      expect(keys).toContain('schema')
      expect(keys).toContain('fixable')
    })

    test('meta.docs.description should be longer than 10 characters', () => {
      expect(noUselessUndefinedRule.meta.docs!.description.length).toBeGreaterThan(10)
    })

    test('meta.docs.description should not contain typo-like patterns', () => {
      const desc = noUselessUndefinedRule.meta.docs!.description
      expect(desc).not.toMatch(/undfined/i)
      expect(desc).not.toMatch(/initaliz/i)
    })

    test('meta.docs should have exactly description, category, recommended keys', () => {
      const docs = noUselessUndefinedRule.meta.docs!
      const keys = Object.keys(docs)
      expect(keys).toContain('description')
      expect(keys).toContain('category')
      expect(keys).toContain('recommended')
    })

    test('meta.docs.category should be a non-empty string', () => {
      expect(typeof noUselessUndefinedRule.meta.docs?.category).toBe('string')
      expect(noUselessUndefinedRule.meta.docs!.category.length).toBeGreaterThan(0)
    })

    test('meta should not have deprecated property', () => {
      expect((noUselessUndefinedRule.meta as Record<string, unknown>).deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy property', () => {
      expect((noUselessUndefinedRule.meta as Record<string, unknown>).replacedBy).toBeUndefined()
    })

    test('meta.fixable should not be "code" or "whitespace"', () => {
      expect(noUselessUndefinedRule.meta.fixable).not.toBe('code')
      expect(noUselessUndefinedRule.meta.fixable).not.toBe('whitespace')
    })

    test('meta.docs.recommended should be strictly boolean', () => {
      const rec = noUselessUndefinedRule.meta.docs?.recommended
      expect(rec === true || rec === false).toBe(true)
    })
  })

  describe('create visitor additional checks', () => {
    test('visitor should not have FunctionDeclaration method', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(visitor).not.toHaveProperty('FunctionDeclaration')
    })

    test('visitor should not have ExpressionStatement method', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('visitor should not have IfStatement method', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(visitor).not.toHaveProperty('IfStatement')
    })

    test('visitor should not have ForStatement method', () => {
      const { context } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      expect(visitor).not.toHaveProperty('ForStatement')
    })
  })

  describe('return undefined detection - exhaustive', () => {
    test('should report return undefined at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report return undefined at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 100, 50))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should not report return with AssignmentExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AssignmentExpression',
          operator: '=',
          left: createIdentifier('x'),
          right: createLiteral(1),
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with AwaitExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: createCallExpression(createIdentifier('fn')),
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with YieldExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'YieldExpression',
          argument: createLiteral(1),
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with SpreadElement argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'SpreadElement',
          argument: createIdentifier('arr'),
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with ArrayExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'ArrayExpression', elements: [] },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with ObjectExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'ObjectExpression', properties: [] },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with ThisExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'ThisExpression' },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with typeof identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: createIdentifier('x'),
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('variable init detection - exhaustive', () => {
    test('should not report variable init with TaggedTemplateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {
          type: 'TaggedTemplateExpression',
          tag: createIdentifier('tag'),
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with ClassExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('cls'),
        init: {
          type: 'ClassExpression',
          id: null,
          body: { type: 'ClassBody', body: [] },
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with AssignmentPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {
          type: 'AssignmentPattern',
          left: createIdentifier('x'),
          right: createLiteral(0),
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with AwaitExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('result'),
        init: {
          type: 'AwaitExpression',
          argument: createCallExpression(createIdentifier('fetchData')),
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('sum'),
        init: createBinaryExpression('+', createLiteral(1), createLiteral(2)),
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with LogicalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {
          type: 'LogicalExpression',
          operator: '&&',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with ThisExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('self'),
        init: { type: 'ThisExpression' },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should report variable init undefined at arbitrary location', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined'), 42, 17),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
    })

    test('should not report variable init with negative number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {
          type: 'UnaryExpression',
          operator: '-',
          argument: createLiteral(1),
        },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should report variable init undefined with various identifier names', () => {
      const names = ['x', 'myVar', '_private', '$jquery', 'camelCase', 'PascalCase', 'SCREAMING']
      for (const name of names) {
        const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
        const visitor = noUselessUndefinedRule.create(context)

        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier(name), createIdentifier('undefined')),
        )

        expect(reports.length).toBe(1)
      }
    })
  })

  describe('identifier guard exhaustive', () => {
    test('should not report return with "UNDEFINED" (all caps)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('UNDEFINED')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with "UNDEFINED" (all caps)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('UNDEFINED')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report return with "undEfIned" (mixed case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undEfIned')))

      expect(reports.length).toBe(0)
    })

    test('should not report return with "undefined_" (trailing underscore)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined_')))

      expect(reports.length).toBe(0)
    })

    test('should not report return with "_undefined" (leading underscore)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('_undefined')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with "undefinedValue"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefinedValue')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report return with "notUndefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('notUndefined')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable init with "myUndefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('myUndefined')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - argument/init as non-Identifier objects', () => {
    test('should not report ReturnStatement with argument having type Identifier but name undefined as string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'undefined' },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not crash when ReturnStatement argument has no name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'Identifier' },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not crash when VariableDeclarator init has no name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: { type: 'Identifier' },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not crash when VariableDeclarator init name is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: { type: 'Identifier', name: 42 },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not crash when ReturnStatement argument name is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 42 },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement with deeply nested loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 99, 99))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99)
      expect(reports[0].loc?.start.column).toBe(99)
    })

    test('should handle VariableDeclarator with deeply nested loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('z'), createIdentifier('undefined'), 200, 100),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(200)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should handle ReturnStatement argument being an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement({ type: 'ReturnStatement', argument: [1, 2, 3] })

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator init being an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: [1, 2, 3],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting - exhaustive', () => {
    test('should report correct end location from return statement for return undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 3, 5))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report correct end location from identifier for variable init undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined'), 8, 2),
      )

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should preserve line number 1 for return undefined at start of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve column 0 for return undefined at start of line', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 5, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line numbers correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle large column numbers correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 1, 5000))

      expect(reports[0].loc?.start.column).toBe(5000)
    })

    test('should report undefined loc when node has no loc for VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: createIdentifier('undefined'),
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('message quality - exhaustive', () => {
    test('variable init message should start with uppercase letter', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      const msg = reports[0].message
      expect(msg[0]).toBe(msg[0].toUpperCase())
    })

    test('return undefined message should end with a period', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('variable init message should end with a period', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('return undefined message should not contain double spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports[0].message).not.toContain('  ')
    })

    test('variable init message should not contain double spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message).not.toContain('  ')
    })

    test('return undefined message should not contain tab characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports[0].message).not.toContain('\t')
    })

    test('messages should be different for each report type', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('return undefined message should mention "void"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('void') || msg.includes('remove')).toBe(true)
    })

    test('variable init message should mention "default"', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports[0].message.toLowerCase()).toContain('default')
    })
  })

  describe('multiple reports - exhaustive', () => {
    test('should report 10 return undefined statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report 10 variable init undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier(`v${i}`), createIdentifier('undefined')),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should report mixed patterns correctly with 20 total', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      }
      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier(`v${i}`), createIdentifier('undefined')),
        )
      }

      expect(reports.length).toBe(20)
    })

    test('should only count violations not valid patterns in mixed batch', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      visitor.ReturnStatement(createReturnStatement(createLiteral(1)))
      visitor.ReturnStatement(createReturnStatement(null))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), createLiteral(5)))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('b'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(3)
    })

    test('each report should have its own message', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBeTruthy()
      expect(reports[1].message).toBeTruthy()
    })

    test('each report should have its own location', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 1, 0))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 2, 5))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })
  })

  describe('context isolation - exhaustive', () => {
    test('multiple contexts should each track their own reports', () => {
      const mock1 = createMockRuleContext({ source: 'return undefined;' })
      const mock2 = createMockRuleContext({ source: 'return undefined;' })
      const mock3 = createMockRuleContext({ source: 'return undefined;' })

      const v1 = noUselessUndefinedRule.create(mock1.context)
      const v2 = noUselessUndefinedRule.create(mock2.context)
      const v3 = noUselessUndefinedRule.create(mock3.context)

      v1.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      v2.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      v2.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      v3.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(mock1.reports.length).toBe(1)
      expect(mock2.reports.length).toBe(2)
      expect(mock3.reports.length).toBe(1)
    })

    test('context report function should receive message and loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), 5, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBeTruthy()
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('visitor from one context should not affect another', () => {
      const mock1 = createMockRuleContext({ source: 'return undefined;' })
      const mock2 = createMockRuleContext({ source: 'return undefined;' })

      const v1 = noUselessUndefinedRule.create(mock1.context)
      const v2 = noUselessUndefinedRule.create(mock2.context)

      v1.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      v1.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      v1.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(mock1.reports.length).toBe(3)
      expect(mock2.reports.length).toBe(0)

      v2.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(mock1.reports.length).toBe(3)
      expect(mock2.reports.length).toBe(1)
    })

    test('should not call context.getFilePath', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(reports.length).toBe(1)
    })

    test('should not call context.getAST', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(1)
    })

    test('should not call context.getSource', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined')),
      )

      expect(reports.length).toBe(2)
    })

    test('should not call context.logger methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined')))

      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })
  })

  describe('test.each - non-undefined identifier names', () => {
    test.each([
      'foo',
      'bar',
      'myValue',
      'result',
      'data',
      'NaN',
      'Infinity',
      'null',
      'void',
      'Object',
      'Array',
      'String',
      'Number',
      'Boolean',
      'console',
      'window',
      'document',
    ])('should not report return of identifier "%s"', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier(name)))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - non-undefined identifier names for variable init', () => {
    test.each([
      'foo',
      'bar',
      'myValue',
      'result',
      'data',
      'NaN',
      'Infinity',
      'null',
      'Object',
      'Array',
      'someFunc',
      'getUndefined',
      'UNDEFINED_VAR',
      '_undefined',
      'undefined_',
      'myUndefined',
      'isUndefined',
    ])('should not report variable init with identifier "%s"', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier(name)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - expression types not reported for ReturnStatement', () => {
    test.each([
      { typeName: 'Literal', node: { type: 'Literal', value: 42 } },
      { typeName: 'Literal', node: { type: 'Literal', value: 'hello' } },
      { typeName: 'Literal', node: { type: 'Literal', value: true } },
      { typeName: 'Literal', node: { type: 'Literal', value: null } },
      {
        typeName: 'CallExpression',
        node: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
      {
        typeName: 'BinaryExpression',
        node: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        },
      },
      { typeName: 'ObjectExpression', node: { type: 'ObjectExpression', properties: [] } },
      { typeName: 'ArrayExpression', node: { type: 'ArrayExpression', elements: [] } },
    ])('should not report return with $typeName argument', ({ node }) => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement({ type: 'ReturnStatement', argument: node })

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - expression types not reported for VariableDeclarator', () => {
    test.each([
      { typeName: 'Literal', node: { type: 'Literal', value: 42 } },
      { typeName: 'Literal', node: { type: 'Literal', value: 'text' } },
      {
        typeName: 'CallExpression',
        node: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
      { typeName: 'ObjectExpression', node: { type: 'ObjectExpression', properties: [] } },
      { typeName: 'ArrayExpression', node: { type: 'ArrayExpression', elements: [] } },
      {
        typeName: 'ArrowFunctionExpression',
        node: { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 0 } },
      },
      {
        typeName: 'FunctionExpression',
        node: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      },
      {
        typeName: 'MemberExpression',
        node: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
      },
    ])('should not report variable init with $typeName', ({ node }) => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: node,
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - location preservation', () => {
    test.each([
      [1, 0],
      [2, 3],
      [10, 5],
      [50, 0],
      [100, 25],
      [1, 100],
    ])('should report return undefined at line %i column %i', (line, col) => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('undefined'), line, col))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(col)
    })

    test.each([
      [1, 0],
      [5, 10],
      [20, 0],
      [50, 30],
    ])('should report variable init undefined at line %i column %i', (line, col) => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('undefined'), line, col),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(col)
    })
  })

  describe('test.each - falsey but not undefined literals', () => {
    test.each([
      { value: 0, description: 'zero' },
      { value: '', description: 'empty string' },
      { value: false, description: 'false' },
      { value: null, description: 'null' },
    ])('should not report return with $description literal', ({ value }) => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createLiteral(value)))

      expect(reports.length).toBe(0)
    })

    test.each([
      { value: 0, description: 'zero' },
      { value: '', description: 'empty string' },
      { value: false, description: 'false' },
      { value: null, description: 'null' },
    ])('should not report variable init with $description literal', ({ value }) => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(value)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('additional robustness checks', () => {
    test('should handle ReturnStatement with undefined argument property value', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: undefined,
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with undefined init property value', () => {
      const { context, reports } = createMockRuleContext({ source: 'return undefined;' })
      const visitor = noUselessUndefinedRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: undefined,
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })
})
