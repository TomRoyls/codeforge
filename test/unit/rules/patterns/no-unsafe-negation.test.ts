import { describe, test, expect, vi } from 'vitest'
import { noUnsafeNegationRule } from '../../../../src/rules/patterns/no-unsafe-negation.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '!(a in b);',
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

function createUnaryExpression(operator: string, argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

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
      end: { line, column: 10 },
    },
  }
}

function createCallExpression(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'func' },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'obj' },
    property: { type: 'Identifier', name: 'prop' },
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-unsafe-negation rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeNegationRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeNegationRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeNegationRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeNegationRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnsafeNegationRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnsafeNegationRule.meta.fixable).toBeUndefined()
    })

    test('should mention negating in description', () => {
      expect(noUnsafeNegationRule.meta.docs?.description.toLowerCase()).toContain('negating')
    })

    test('should mention relational in description', () => {
      expect(noUnsafeNegationRule.meta.docs?.description.toLowerCase()).toContain('relational')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })
  })

  describe('valid cases - other operators', () => {
    test('should not report positive negation operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '+',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report negative negation operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '-',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report bitwise NOT operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '~',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('typeof', createIdentifier('a')))

      expect(reports.length).toBe(0)
    })

    test('should not report void operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('void', createIdentifier('a')))

      expect(reports.length).toBe(0)
    })

    test('should not report delete operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('delete', createMemberExpression()))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - non-relational operators', () => {
    test('should not report ! with equality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with inequality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('!==', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with less than operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('<', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with greater than operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('>', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with less than or equal operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('<=', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with greater than or equal operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('>=', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with addition operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with subtraction operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('-', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with logical and operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('&&', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with logical or operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('||', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - non-BinaryExpression arguments', () => {
    test('should not report ! with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createIdentifier('a')))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(true)))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createCallExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createMemberExpression()))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases - in operator', () => {
    test('should report ! with in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('in')
    })

    test('should report ! with in operator and literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createLiteral('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report ! with in operator and member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createMemberExpression(), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should include operator name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message).toContain("'in'")
    })
  })

  describe('invalid cases - instanceof operator', () => {
    test('should report ! with instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('instanceof')
    })

    test('should report ! with instanceof operator and literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createLiteral('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report ! with instanceof operator and member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createMemberExpression(), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should include operator name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message).toContain("'instanceof'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(() => visitor.UnaryExpression(123)).not.toThrow()
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          10,
          5,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
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
        getSource: () => '!(a in b);',
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

      const visitor = noUnsafeNegationRule.create(context)

      expect(() =>
        visitor.UnaryExpression(
          createUnaryExpression(
            '!',
            createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          ),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('c'), createIdentifier('d')),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle consecutive violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('c'), createIdentifier('d')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('e'), createIdentifier('f')),
        ),
      )

      expect(reports.length).toBe(3)
    })

    test('should handle BinaryExpression without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(createUnaryExpression('!', node))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include negating in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('negating')
    })

    test('should include left operand in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('left operand')
    })

    test('should include operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain("'instanceof'")
    })
  })
})
