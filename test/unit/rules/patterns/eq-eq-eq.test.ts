import { describe, test, expect, vi } from 'vitest'
import { eqEqEqRule } from '../../../../src/rules/patterns/eq-eq-eq.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'x == y;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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
  left: unknown,
  right: unknown,
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
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

describe('eq-eq-eq rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(eqEqEqRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(eqEqEqRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(eqEqEqRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(eqEqEqRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(eqEqEqRule.meta.schema).toBeDefined()
    })

    test('should be fixable with code', () => {
      expect(eqEqEqRule.meta.fixable).toBe('code')
    })

    test('should mention strict equality in description', () => {
      expect(eqEqEqRule.meta.docs?.description.toLowerCase()).toContain('strict equality')
    })

    test('should mention loose equality in description', () => {
      expect(eqEqEqRule.meta.docs?.description.toLowerCase()).toContain('loose equality')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting == operator', () => {
    test('should report x == y', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected '==='")
    })

    test('should report 5 == "5"', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(5), createLiteral('5'), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report true == 1', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(true), createLiteral(1), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report null == undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(undefined), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == null', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createLiteral(null), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 == ""', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createLiteral(''), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting != operator', () => {
    test('should report x != y', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected '!=='")
    })

    test('should report 5 != "5"', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(5), createLiteral('5'), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x != null', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createLiteral(null), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting strict equality operators', () => {
    test('should not report x === y', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 5 === 5', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(5), createLiteral(5), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x !== y', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report null !== undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(undefined), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('allowing null == null pattern', () => {
    test('should not report null == null', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(null), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report null != null', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(null), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('other operators', () => {
    test('should not report > operator', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report < operator', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '<')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report >= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report <= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '<=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(
        createIdentifier('x', 10, 5),
        createIdentifier('y', 10, 15),
        '==',
        10,
        5,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'x == y;',
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

      const visitor = eqEqEqRule.create(context)

      expect(() =>
        visitor.BinaryExpression(
          createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 20 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {},
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention expected operator === for ==', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports[0].message).toContain("Expected '==='")
    })

    test('should mention expected operator !== for !=', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!='),
      )

      expect(reports[0].message).toContain("Expected '!=='")
    })

    test('should mention actual operator == in message', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports[0].message).toContain("and instead saw '=='")
    })

    test('should mention actual operator != in message', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!='),
      )

      expect(reports[0].message).toContain("and instead saw '!='")
    })
  })

  describe('fix functionality', () => {
    test('should provide fix when node has range property (==)', () => {
      const source = 'x == y'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x', range: [0, 1] as [number, number] },
        right: { type: 'Identifier', name: 'y', range: [5, 6] as [number, number] },
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 6] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([0, 6])
      expect(reports[0].fix?.text).toBe('x === y')
    })

    test('should provide fix when node has range property (!=)', () => {
      const source = 'a != b'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'a', range: [0, 1] as [number, number] },
        right: { type: 'Identifier', name: 'b', range: [5, 6] as [number, number] },
        operator: '!=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 6] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('a !== b')
    })
  })

  describe('edge cases with null/undefined operands', () => {
    test('should report when left operand is null', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: null,
        right: createIdentifier('y'),
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when left operand is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: undefined,
        right: createIdentifier('y'),
        operator: '!=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when left operand is non-object', () => {
      const { context, reports } = createMockContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: 'string',
        right: createIdentifier('y'),
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
