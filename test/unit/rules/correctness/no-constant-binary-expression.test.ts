import { describe, test, expect, vi } from 'vitest'
import { noConstantBinaryExpressionRule } from '../../../../src/rules/correctness/no-constant-binary-expression.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createUnaryExpression(argument: unknown, operator: string, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-constant-binary-expression rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noConstantBinaryExpressionRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noConstantBinaryExpressionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.category).toBe('correctness')
    })

    test('should have schema defined', () => {
      expect(noConstantBinaryExpressionRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.description).toContain('constant')
    })
  })

  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should report comparison with boolean literal on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '==='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
      expect(reports[0].message).toContain('left')
    })

    test('should report comparison with boolean literal on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('foo'), createLiteral(false), '==='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
      expect(reports[0].message).toContain('right')
    })

    test('should report comparison with numeric literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('count'), '==='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should report comparison with numeric literal 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('status'), createLiteral(1), '!=='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should not report comparison with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('foo'), createIdentifier('str'), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report comparison with two variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report comparison with two literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createLiteral(false), '==='),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report comparison with non-strict operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '=='),
      )

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '===', 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report comparison with !true on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(true), '!'),
          createIdentifier('flag'),
          '===',
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should report comparison with !false on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('flag'),
          createUnaryExpression(createLiteral(false), '!'),
          '!==',
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should report comparison with numeric literal 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(42), createIdentifier('count'), '==='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should report comparison with negative numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('temperature'), createLiteral(-1), '!=='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should not report comparison with !variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createIdentifier('flag'), '!'),
          createIdentifier('other'),
          '===',
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report comparison with non-boolean unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral('string'), '!'),
          createIdentifier('x'),
          '===',
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: createIdentifier('foo'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral(true),
        right: createIdentifier('foo'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include helpful guidance', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '==='),
      )

      expect(reports[0].message).toContain('mistake')
    })
  })

  describe('meta detailed', () => {
    test('meta.type should be the string "problem"', () => {
      expect(noConstantBinaryExpressionRule.meta.type).toBe('problem')
      expect(typeof noConstantBinaryExpressionRule.meta.type).toBe('string')
    })

    test('meta.severity should be the string "warn"', () => {
      expect(noConstantBinaryExpressionRule.meta.severity).toBe('warn')
      expect(typeof noConstantBinaryExpressionRule.meta.severity).toBe('string')
    })

    test('meta.docs.description should mention comparison', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.description).toContain('comparison')
    })

    test('meta.docs.url should be a string', () => {
      expect(typeof noConstantBinaryExpressionRule.meta.docs?.url).toBe('string')
      expect(noConstantBinaryExpressionRule.meta.docs?.url).toContain('http')
    })

    test('meta.schema should be an empty array', () => {
      const schema = noConstantBinaryExpressionRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema.length).toBe(0)
    })

    test('meta.fixable should be undefined', () => {
      expect(noConstantBinaryExpressionRule.meta.fixable).toBeUndefined()
    })

    test('create should return an object with only BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      expect(Object.keys(visitor)).toEqual(['BinaryExpression'])
    })
  })

  describe('boolean constants on left with ===', () => {
    test('should flag true === flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('flag'), '==='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
      expect(reports[0].message).toContain('left')
    })

    test('should flag false === result', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('result'), '==='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should flag true === isEnabled', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('isEnabled'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag false === hasData', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('hasData'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag true === shouldSkip', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('shouldSkip'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag false === isActive', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('isActive'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag true === isReady', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('isReady'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag false === isDone', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('isDone'), '==='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('boolean constants on left with !==', () => {
    test('should flag true !== flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('flag'), '!=='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should flag false !== result', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('result'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag true !== isEnabled', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('isEnabled'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag false !== hasData', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('hasData'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag true !== shouldSkip', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('shouldSkip'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag false !== isActive', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('isActive'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag true !== isReady', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('isReady'), '!=='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('boolean constants on right with ===', () => {
    test('should flag flag === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('flag'), createLiteral(true), '==='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('right')
    })

    test('should flag result === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('result'), createLiteral(false), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag isEnabled === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('isEnabled'), createLiteral(true), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag hasData === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('hasData'), createLiteral(false), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag shouldSkip === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('shouldSkip'), createLiteral(true), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag isActive === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('isActive'), createLiteral(false), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag isReady === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('isReady'), createLiteral(true), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag done === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('done'), createLiteral(false), '==='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('boolean constants on right with !==', () => {
    test('should flag flag !== true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('flag'), createLiteral(true), '!=='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should flag result !== false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('result'), createLiteral(false), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag isEnabled !== true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('isEnabled'), createLiteral(true), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag hasData !== false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('hasData'), createLiteral(false), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag shouldSkip !== true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('shouldSkip'), createLiteral(true), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag isActive !== false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('isActive'), createLiteral(false), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag isReady !== true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('isReady'), createLiteral(true), '!=='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('numeric constants on left with ===', () => {
    test('should flag 0 === count', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('count'), '==='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should flag 1 === status', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('status'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 2 === mode', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(2), createIdentifier('mode'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 42 === answer', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(42), createIdentifier('answer'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag -1 === errorCode', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIdentifier('errorCode'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 100 === score', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(100), createIdentifier('score'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 999 === maxValue', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(999), createIdentifier('maxValue'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 3 === retryCount', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(3), createIdentifier('retryCount'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 10 === limit', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(10), createIdentifier('limit'), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag -5 === offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-5), createIdentifier('offset'), '==='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('numeric constants on left with !==', () => {
    test('should flag 0 !== count', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('count'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 1 !== status', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('status'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 42 !== answer', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(42), createIdentifier('answer'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag -1 !== errorCode', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIdentifier('errorCode'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 100 !== score', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(100), createIdentifier('score'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag 999 !== maxValue', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(999), createIdentifier('maxValue'), '!=='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('numeric constants on right with ===', () => {
    test('should flag count === 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('count'), createLiteral(0), '==='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should flag status === 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('status'), createLiteral(1), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag mode === 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('mode'), createLiteral(2), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag answer === 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('answer'), createLiteral(42), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag errorCode === -1', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('errorCode'), createLiteral(-1), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag score === 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('score'), createLiteral(100), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag maxValue === 999', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('maxValue'), createLiteral(999), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag retryCount === 3', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('retryCount'), createLiteral(3), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag limit === 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('limit'), createLiteral(10), '==='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag offset === -5', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('offset'), createLiteral(-5), '==='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('numeric constants on right with !==', () => {
    test('should flag count !== 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('count'), createLiteral(0), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag status !== 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('status'), createLiteral(1), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag answer !== 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('answer'), createLiteral(42), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag errorCode !== -1', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('errorCode'), createLiteral(-1), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag score !== 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('score'), createLiteral(100), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag maxValue !== 999', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('maxValue'), createLiteral(999), '!=='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('unary ! boolean on left', () => {
    test('should flag !true === flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(true), '!'),
          createIdentifier('flag'),
          '===',
        ),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
      expect(reports[0].message).toContain('false')
    })

    test('should flag !false === flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(false), '!'),
          createIdentifier('flag'),
          '===',
        ),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
      expect(reports[0].message).toContain('true')
    })

    test('should flag !true !== result', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(true), '!'),
          createIdentifier('result'),
          '!==',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag !false !== result', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(false), '!'),
          createIdentifier('result'),
          '!==',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag !true === shouldProceed', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(true), '!'),
          createIdentifier('shouldProceed'),
          '===',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag !false === isCancelled', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(false), '!'),
          createIdentifier('isCancelled'),
          '===',
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('unary ! boolean on right', () => {
    test('should flag flag === !true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('flag'),
          createUnaryExpression(createLiteral(true), '!'),
          '===',
        ),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('false')
    })

    test('should flag flag === !false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('flag'),
          createUnaryExpression(createLiteral(false), '!'),
          '===',
        ),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('true')
    })

    test('should flag result !== !true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('result'),
          createUnaryExpression(createLiteral(true), '!'),
          '!==',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag result !== !false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('result'),
          createUnaryExpression(createLiteral(false), '!'),
          '!==',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag shouldProceed === !true', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('shouldProceed'),
          createUnaryExpression(createLiteral(true), '!'),
          '===',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should flag isCancelled === !false', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('isCancelled'),
          createUnaryExpression(createLiteral(false), '!'),
          '===',
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('NOT flagged: non-strict operators', () => {
    test('should not flag == with boolean constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag != with boolean constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('bar'), '!='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag < with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('count'), '<'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag > with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(10), createIdentifier('value'), '>'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag <= with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(5), createIdentifier('limit'), '<='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag >= with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(100), createIdentifier('max'), '>='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag + with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('delta'), '+'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag - with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(5), createIdentifier('offset'), '-'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag * with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(2), createIdentifier('factor'), '*'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag / with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('numerator'), createLiteral(3), '/'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag % with numeric constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('value'), createLiteral(2), '%'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag && with boolean constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('condition'), '&&'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag || with boolean constant', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('fallback'), '||'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag ?? operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('maybe'), createLiteral(0), '??'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag & bitwise operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIdentifier('bits'), '&'),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: string literals', () => {
    test('should not flag "foo" === identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('foo'), createIdentifier('str'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag identifier === "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('str'), createLiteral('bar'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag empty string === identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(''), createIdentifier('name'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag identifier === empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('name'), createLiteral(''), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag "hello" !== identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('hello'), createIdentifier('greeting'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag identifier !== "world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('greeting'), createLiteral('world'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag "test" === name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('test'), createIdentifier('name'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag name === "test"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('name'), createLiteral('test'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag "" !== result', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(''), createIdentifier('result'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag result !== ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('result'), createLiteral(''), '!=='),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: null and undefined literals', () => {
    test('should not flag null === identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(null), createIdentifier('val'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag identifier === null', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('val'), createLiteral(null), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag undefined === identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(undefined), createIdentifier('val'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag identifier === undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('val'), createLiteral(undefined), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag null !== identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(null), createIdentifier('val'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag identifier !== undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('val'), createLiteral(undefined), '!=='),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: both sides non-constant', () => {
    test('should not flag a === b', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag foo !== bar', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('foo'), createIdentifier('bar'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag count === total', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('count'), createIdentifier('total'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag name === otherName', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('name'), createIdentifier('otherName'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag result !== expected', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('result'), createIdentifier('expected'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag flag === isActive', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('flag'), createIdentifier('isActive'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag x !== y', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag first === second', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('first'), createIdentifier('second'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag left !== right', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('left'), createIdentifier('right'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag input === output', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('input'), createIdentifier('output'), '==='),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: !identifier (not constant)', () => {
    test('should not flag !flag === other', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createIdentifier('flag'), '!'),
          createIdentifier('other'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag other !== !done', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('other'),
          createUnaryExpression(createIdentifier('done'), '!'),
          '!==',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag !isActive === other', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createIdentifier('isActive'), '!'),
          createIdentifier('other'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag other === !isEnabled', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('other'),
          createUnaryExpression(createIdentifier('isEnabled'), '!'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag !hasData !== result', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createIdentifier('hasData'), '!'),
          createIdentifier('result'),
          '!==',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not flag result === !shouldSkip', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('result'),
          createUnaryExpression(createIdentifier('shouldSkip'), '!'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('both sides constant', () => {
    test('should flag true === false (reports left side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createLiteral(false), '==='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('left')
      expect(reports[0].message).toContain('true')
    })

    test('should flag false === true (reports left side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createLiteral(true), '==='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('left')
    })

    test('should flag 0 === 1 (reports left side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(createBinaryExpression(createLiteral(0), createLiteral(1), '==='))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should flag 1 !== 0 (reports left side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(createBinaryExpression(createLiteral(1), createLiteral(0), '!=='))
      expect(reports.length).toBe(1)
    })

    test('should flag true !== true (reports left side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createLiteral(true), '!=='),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('left')
    })

    test('should flag false === false (reports left side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createLiteral(false), '==='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('violation message format', () => {
    test('message should contain "Unexpected comparison"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('Unexpected comparison')
    })

    test('message should contain "constant"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('constant')
    })

    test('boolean violation message should contain "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('boolean')
    })

    test('boolean violation message should contain the actual value', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('true')
    })

    test('false value should appear in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('false')
    })

    test('left side constant should show "left" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('left')
    })

    test('right side constant should show "right" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createLiteral(false), '==='),
      )
      expect(reports[0].message).toContain('right')
    })

    test('numeric violation message should contain "numeric"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('numeric')
    })

    test('numeric violation message should contain the actual number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(42), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('42')
    })

    test('!true violation message should contain "false" as value', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(true), '!'),
          createIdentifier('x'),
          '===',
        ),
      )
      expect(reports[0].message).toContain('false')
      expect(reports[0].message).toContain('boolean')
    })

    test('!false violation message should contain "true" as value', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('x'),
          createUnaryExpression(createLiteral(false), '!'),
          '===',
        ),
      )
      expect(reports[0].message).toContain('true')
      expect(reports[0].message).toContain('boolean')
    })

    test('message should contain "mistake"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('x'), '==='),
      )
      expect(reports[0].message).toContain('mistake')
    })
  })

  describe('violation location', () => {
    test('should report location at default position', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 3 column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '===', 3, 5),
      )
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('x'), '===', 100, 50),
      )
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('x'), '===', 0, 0),
      )
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with null loc gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: createIdentifier('x'),
        loc: null,
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with undefined loc gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: createIdentifier('x'),
        loc: undefined,
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with partial loc (missing start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: createIdentifier('x'),
        loc: {
          end: { line: 5, column: 20 },
        },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(0),
        right: createIdentifier('x'),
        loc: {
          start: { line: 7, column: 3 },
        },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node with missing line in start', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: createIdentifier('x'),
        loc: {
          start: { column: 5 },
          end: { line: 2, column: 10 },
        },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node with missing column in end', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: createIdentifier('x'),
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 3 },
        },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  describe('multiple violations in sequence', () => {
    test('should accumulate 2 violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('y'), createLiteral(0), '!=='),
      )

      expect(reports.length).toBe(2)
    })

    test('should accumulate 3 violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(false), createIdentifier('y'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('z'), createLiteral(1), '!=='),
      )

      expect(reports.length).toBe(3)
    })

    test('should accumulate 5 violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createLiteral(true), createIdentifier(`x${i}`), '==='),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should accumulate mixed boolean and numeric violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('y'), '==='),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('boolean')
      expect(reports[1].message).toContain('numeric')
    })

    test('should not count non-violations in total', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('str'), createIdentifier('c'), '==='),
      )

      expect(reports.length).toBe(1)
    })

    test('should correctly identify left vs right in alternating violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('x'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('y'), createLiteral(false), '!=='),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('left')
      expect(reports[1].message).toContain('right')
    })
  })

  describe('edge cases expanded', () => {
    test('should handle empty object node', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'CallExpression',
        operator: '===',
        left: createLiteral(true),
        right: createIdentifier('x'),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node where left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: null,
        right: createIdentifier('x'),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: null,
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node where left is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: undefined,
        right: createIdentifier('x'),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where right is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: undefined,
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node that is an array', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      expect(() => visitor.BinaryExpression([])).not.toThrow()
    })

    test('should handle node that is a number', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
    })

    test('should handle Literal with object value (not boolean/number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      const objLiteral = {
        type: 'Literal',
        value: { key: 'val' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.BinaryExpression(createBinaryExpression(objLiteral, createIdentifier('x'), '==='))
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(true), '-'),
          createIdentifier('x'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with + operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(true), '+'),
          createIdentifier('x'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with ! but non-Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression({ type: 'CallExpression', callee: createIdentifier('fn') }, '!'),
          createIdentifier('x'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with ! but string Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral('hello'), '!'),
          createIdentifier('x'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with ! but null Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(null), '!'),
          createIdentifier('x'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with ! but numeric Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createUnaryExpression(createLiteral(5), '!'),
          createIdentifier('x'),
          '===',
        ),
      )
      expect(reports.length).toBe(0)
    })
  })
})
