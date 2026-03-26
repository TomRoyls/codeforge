import { describe, test, expect, vi } from 'vitest'
import { noUselessConcatRule } from '../../../../src/rules/patterns/no-useless-concat.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const s = "" + str;',
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

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createEmptyStringLiteral(): unknown {
  return {
    type: 'Literal',
    value: '',
  }
}

function createNonEmptyStringLiteral(value: string): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createNumericLiteral(value: number): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('no-useless-concat rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessConcatRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUselessConcatRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUselessConcatRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessConcatRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUselessConcatRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUselessConcatRule.meta.fixable).toBeUndefined()
    })

    test('should mention concatenation in description', () => {
      expect(noUselessConcatRule.meta.docs?.description.toLowerCase()).toContain('concatenat')
    })

    test('should mention empty string in description', () => {
      expect(noUselessConcatRule.meta.docs?.description.toLowerCase()).toContain('empty string')
    })
  })

  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting empty string concat on left', () => {
    test('should report when left operand is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + variable pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('myVar'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + number pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createNumericLiteral(42))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting empty string concat on right', () => {
    test('should report when right operand is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('str'), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report variable + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createIdentifier('myVar'),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report number + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createNumericLiteral(42), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('allowing valid concatenations', () => {
    test('should not report when both operands are non-empty strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('hello'),
        createNonEmptyStringLiteral('world'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating non-empty string with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('hello '),
        createIdentifier('name'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating variable with non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createIdentifier('name'),
        createNonEmptyStringLiteral('!'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating two variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('non-plus operators', () => {
    test('should not report for minus operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('-', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for multiply operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('*', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for division operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('/', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for strict equality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for less than operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('<', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        operator: '+',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        operator: '+',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle missing operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle missing left operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        right: createIdentifier('str'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle missing right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createEmptyStringLiteral(),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle null left operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', null, createIdentifier('str'))

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('str'), null)

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle literal that is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        { type: 'Literal', value: 0 },
        createIdentifier('str'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle literal with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        { type: 'Literal', value: null },
        createIdentifier('str'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle literal without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', { type: 'Literal' }, createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty string on both sides', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      // Should report (both are empty strings)
      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should include location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 10, column: 5 }, end: { line: 10, column: 20 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple useless concatenations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node1 = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str1'),
      )

      const node2 = createBinaryExpression(
        '+',
        createIdentifier('str2'),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports.length).toBe(2)
    })
  })

  describe('message quality', () => {
    test('should mention useless in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('useless')
    })

    test('should mention concatenation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('concatenat')
    })

    test('should mention empty string in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('empty string')
    })
  })
})
