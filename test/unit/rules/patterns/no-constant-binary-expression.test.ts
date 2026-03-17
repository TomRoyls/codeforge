import { describe, test, expect, vi } from 'vitest'
import { noConstantBinaryExpressionRule } from '../../../../src/rules/patterns/no-constant-binary-expression.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => 'true || x',
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

  return { context, reports }
}

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
  describe('meta', () => {
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
  })

  describe('create', () => {
    test('should return visitor with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return visitor with LogicalExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
    })

    test('BinaryExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('LogicalExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(typeof visitor.LogicalExpression).toBe('function')
    })
  })

  describe('valid cases - BinaryExpression', () => {
    test('should not report regular binary expression with identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '+')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with non-constant left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createLiteral(1), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with || and falsy left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with || and empty string left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(''), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with || and false left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with && and truthy left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with && and non-empty string left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with ?? and null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with ?? and undefined left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(undefined), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression with operators other than ||, &&, ??', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '+')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - LogicalExpression', () => {
    test('should not report logical expression with non-constant left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createIdentifier('x'), createLiteral(1), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with || and falsy left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(0), createIdentifier('y'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with ?? and null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(null), createIdentifier('y'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical expression with && and truthy left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(true), createIdentifier('y'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases - BinaryExpression', () => {
    test('should report binary expression with || and truthy number left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report binary expression with || and truthy string left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral('text'), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report binary expression with || and true left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(true), createIdentifier('x'), '||')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report binary expression with ?? and non-null literal left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report binary expression with ?? and non-undefined literal left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral('text'), createIdentifier('x'), '??')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report binary expression with && and null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report binary expression with && and false left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(false), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report binary expression with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||', 10, 5)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report each violation separately', () => {
      const { context, reports } = createMockContext()
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
  })

  describe('invalid cases - LogicalExpression', () => {
    test('should report logical expression with || and truthy left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '||')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report logical expression with ?? and non-null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(1), createIdentifier('x'), '??')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })

    test('should report logical expression with && and false left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createLogicalExpression(createLiteral(false), createIdentifier('x'), '&&')
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduces to the left operand')
    })
  })

  describe('edge cases', () => {
    test('should handle null BinaryExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined BinaryExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null LogicalExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined LogicalExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIdentifier('x'), '||')
      delete (node as Record<string, unknown>).loc

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle object that is not a valid AST node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = { type: 'BinaryExpression' }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle wrong node type for BinaryExpression visitor', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression('string' as unknown)
      visitor.LogicalExpression(123 as unknown)

      expect(reports.length).toBe(0)
    })

    test('should handle 0 in && expression (should not report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty string in && expression (should not report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(''), createIdentifier('x'), '&&')
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
