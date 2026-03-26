import { describe, test, expect, vi } from 'vitest'
import { noSequencesRule } from '../../../../src/rules/patterns/no-sequences.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'a, b, c',
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
    config: { rules: { 'no-sequences': ['error', options] } },
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

// Factory functions for creating AST nodes
function createSequenceExpression(expressions: unknown[], lineNumber = 1, column = 0): unknown {
  return {
    type: 'SequenceExpression',
    expressions,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createLiteral(value: unknown): unknown {
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

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
  }
}

function createBinaryExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
  }
}

describe('no-sequences rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSequencesRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noSequencesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noSequencesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSequencesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noSequencesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noSequencesRule.meta.fixable).toBeUndefined()
    })

    test('should mention comma in description', () => {
      const desc = noSequencesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('comma')
    })

    test('should mention sequence in description', () => {
      const desc = noSequencesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('sequence')
    })

    test('should have empty schema array', () => {
      expect(noSequencesRule.meta.schema).toEqual([])
    })

    test('should have documentation URL', () => {
      expect(noSequencesRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/no-sequences')
    })

    test('should mention confusing in description', () => {
      const desc = noSequencesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('confusing')
    })

    test('should mention bugs in description', () => {
      const desc = noSequencesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('bug')
    })
  })

  describe('create', () => {
    test('should return visitor object with SequenceExpression method', () => {
      const { context } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(visitor).toHaveProperty('SequenceExpression')
      expect(typeof visitor.SequenceExpression).toBe('function')
    })
  })

  describe('detecting sequence expressions', () => {
    test('should report sequence expression with 2 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence expression with 3 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2), createLiteral(3)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence expression with many expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createIdentifier('a'),
        createIdentifier('b'),
        createIdentifier('c'),
        createIdentifier('d'),
        createIdentifier('e'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct message for sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports[0].message).toContain('comma')
    })

    test('should report sequence with mixed expression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createCallExpression(createIdentifier('foo')),
        createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
        createIdentifier('x'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('non-reporting cases', () => {
    test('should not report sequence expression with 1 expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sequence expression with 0 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sequence expression with undefined expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression' }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(() => visitor.SequenceExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(() => visitor.SequenceExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(() => visitor.SequenceExpression('string')).not.toThrow()
      expect(() => visitor.SequenceExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { expressions: [createLiteral(1), createLiteral(2)] }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: null }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle expressions as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: 'not-an-array' }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined rule config', () => {
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
        getSource: () => 'a, b, c',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSequencesRule.create(context)
      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expressions array with null elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      // Array has 2 elements but one is null - still length 2
      const node = createSequenceExpression([createLiteral(1), null])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expressions array with undefined elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), undefined])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)], 10, 5)
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)], 5, 10)
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for multiple sequence expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node1 = createSequenceExpression([createLiteral(1), createLiteral(2)], 1, 0)
      const node2 = createSequenceExpression([createLiteral(3), createLiteral(4)], 5, 10)
      const node3 = createSequenceExpression([createLiteral(5), createLiteral(6)], 10, 20)

      visitor.SequenceExpression(node1)
      visitor.SequenceExpression(node2)
      visitor.SequenceExpression(node3)

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })
  })

  describe('message quality', () => {
    test('should mention comma operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('comma')
    })

    test('should mention sequence in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('sequence')
    })

    test('should mention unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node1 = createSequenceExpression([createIdentifier('a'), createIdentifier('b')])
      const node2 = createSequenceExpression([createLiteral(1), createLiteral(2), createLiteral(3)])

      visitor.SequenceExpression(node1)
      visitor.SequenceExpression(node2)

      expect(reports.length).toBe(2)
      // Both should have the same message format
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('multiple sequence expressions in same context', () => {
    test('should report each sequence expression independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))
      visitor.SequenceExpression(createSequenceExpression([createLiteral(3), createLiteral(4)]))
      visitor.SequenceExpression(createSequenceExpression([createLiteral(5), createLiteral(6)]))

      expect(reports.length).toBe(3)
    })

    test('should only report sequences with > 1 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      // Single expression - no report
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1)]))

      // Two expressions - report
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      // Single expression - no report
      visitor.SequenceExpression(createSequenceExpression([createIdentifier('x')]))

      // Three expressions - report
      visitor.SequenceExpression(
        createSequenceExpression([createLiteral(1), createLiteral(2), createLiteral(3)]),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle mixed valid and invalid sequence expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      // Valid: empty
      visitor.SequenceExpression(createSequenceExpression([]))

      // Invalid: 2 expressions
      visitor.SequenceExpression(
        createSequenceExpression([createIdentifier('a'), createIdentifier('b')]),
      )

      // Valid: 1 expression
      visitor.SequenceExpression(createSequenceExpression([createIdentifier('x')]))

      // Invalid: 3 expressions
      visitor.SequenceExpression(
        createSequenceExpression([
          createCallExpression(createIdentifier('fn')),
          createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
          createIdentifier('result'),
        ]),
      )

      expect(reports.length).toBe(2)
    })
  })

  describe('expression types in sequences', () => {
    test('should report sequence with identifier expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createIdentifier('foo'), createIdentifier('bar')])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with literal expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral('string'), createLiteral(42)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createCallExpression(createIdentifier('foo')),
        createCallExpression(createIdentifier('bar')),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
        createBinaryExpression(createLiteral(3), '*', createLiteral(4)),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with mixed expression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createIdentifier('x'),
        createLiteral(42),
        createCallExpression(createIdentifier('fn')),
        createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
