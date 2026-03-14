import { describe, test, expect, vi } from 'vitest'
import { noNestedTernaryRule } from '../../../../src/rules/patterns/no-nested-ternary.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'condition ? a : b;',
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

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
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

function createLiteral(value: string | number | boolean, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + String(value).length },
    },
  }
}

describe('no-nested-ternary rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noNestedTernaryRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noNestedTernaryRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noNestedTernaryRule.meta.docs?.recommended).toBe(true)
    })

    test('should have style category', () => {
      expect(noNestedTernaryRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(noNestedTernaryRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noNestedTernaryRule.meta.fixable).toBe('code')
    })

    test('should mention ternary in description', () => {
      expect(noNestedTernaryRule.meta.docs?.description.toLowerCase()).toContain('ternary')
    })

    test('should mention nesting in description', () => {
      expect(noNestedTernaryRule.meta.docs?.description.toLowerCase()).toContain('nest')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      expect(visitor).toHaveProperty('ConditionalExpression')
    })
  })

  describe('detecting nested ternary in consequent', () => {
    test('should report ternary nested in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const outerCondition = createIdentifier('x')
      const innerCondition = createIdentifier('y')
      const innerConsequent = createLiteral(1)
      const innerAlternate = createLiteral(2)
      const innerTernary = createConditionalExpression(
        innerCondition,
        innerConsequent,
        innerAlternate,
      )
      const outerAlternate = createLiteral(3)
      const node = createConditionalExpression(outerCondition, innerTernary, outerAlternate)

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nest')
    })

    test('should report deeply nested ternary in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const level1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const level2 = createConditionalExpression(createIdentifier('b'), level1, createLiteral(3))
      const level3 = createConditionalExpression(createIdentifier('c'), level2, createLiteral(4))

      visitor.ConditionalExpression(level3)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting nested ternary in alternate', () => {
    test('should report ternary nested in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const outerCondition = createIdentifier('x')
      const outerConsequent = createLiteral(1)
      const innerCondition = createIdentifier('y')
      const innerConsequent = createLiteral(2)
      const innerAlternate = createLiteral(3)
      const innerTernary = createConditionalExpression(
        innerCondition,
        innerConsequent,
        innerAlternate,
      )
      const node = createConditionalExpression(outerCondition, outerConsequent, innerTernary)

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nest')
    })

    test('should report deeply nested ternary in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const level1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const level2 = createConditionalExpression(createIdentifier('b'), createLiteral(3), level1)
      const level3 = createConditionalExpression(createIdentifier('c'), createLiteral(4), level2)

      visitor.ConditionalExpression(level3)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting nested ternary in both branches', () => {
    test('should report ternary nested in both consequent and alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const outerCondition = createIdentifier('x')
      const innerCondition1 = createIdentifier('y')
      const innerCondition2 = createIdentifier('z')
      const innerTernary1 = createConditionalExpression(
        innerCondition1,
        createLiteral(1),
        createLiteral(2),
      )
      const innerTernary2 = createConditionalExpression(
        innerCondition2,
        createLiteral(3),
        createLiteral(4),
      )
      const node = createConditionalExpression(outerCondition, innerTernary1, innerTernary2)

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting non-nested ternaries', () => {
    test('should not report simple ternary with literal consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report simple ternary with identifier consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createIdentifier('a'),
        createIdentifier('b'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report simple ternary with binary expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        {
          type: 'BinaryExpression',
          operator: '+',
          left: createIdentifier('a'),
          right: createLiteral(1),
        },
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report simple ternary with call expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        },
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report simple ternary with member expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('prop'),
        },
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression('string')).not.toThrow()
      expect(() => visitor.ConditionalExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'y' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        alternate: { type: 'Literal', value: 3 },
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 10, 5),
        createConditionalExpression(
          createIdentifier('y', 11, 10),
          createLiteral(1, 12, 5),
          createLiteral(2, 12, 10),
        ),
        createLiteral(3, 13, 5),
        10,
        5,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
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
        getSource: () => 'condition ? a : b;',
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

      const visitor = noNestedTernaryRule.create(context)

      expect(() =>
        visitor.ConditionalExpression(
          createConditionalExpression(
            createIdentifier('x'),
            createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
            createLiteral(3),
          ),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple levels of nesting', () => {
    test('should report each level of nesting when visited separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const level1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const level2 = createConditionalExpression(createIdentifier('b'), level1, createLiteral(3))
      const level3 = createConditionalExpression(createIdentifier('c'), level2, createLiteral(4))
      const level4 = createConditionalExpression(createIdentifier('d'), level3, createLiteral(5))

      visitor.ConditionalExpression(level2)
      visitor.ConditionalExpression(level3)
      visitor.ConditionalExpression(level4)

      expect(reports.length).toBe(3)
    })
  })

  describe('message quality', () => {
    test('should mention nesting in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('nest')
    })

    test('should mention ternary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('should mention if-else in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('if-else')
    })
  })

  describe('various ternary patterns', () => {
    test('should report nested ternary with boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(
            createIdentifier('y'),
            createLiteral(true),
            createLiteral(false),
          ),
          createLiteral(true),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(
            createIdentifier('y'),
            createLiteral('a'),
            createLiteral('b'),
          ),
          createLiteral('c'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(0), createLiteral(1)),
          createLiteral(2),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report ternary with non-nested consequent and alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'BinaryExpression',
            operator: '===',
            left: createIdentifier('a'),
            right: createLiteral(1),
          },
          { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report nested ternary with complex consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const nestedTernary = createConditionalExpression(
        createIdentifier('y'),
        {
          type: 'BinaryExpression',
          operator: '+',
          left: createLiteral(1),
          right: createLiteral(2),
        },
        {
          type: 'BinaryExpression',
          operator: '-',
          left: createLiteral(3),
          right: createLiteral(4),
        },
      )

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), nestedTernary, createLiteral(5)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with complex alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      const nestedTernary = createConditionalExpression(
        createIdentifier('y'),
        {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('prop'),
        },
        createIdentifier('value'),
      )

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(5), nestedTernary),
      )

      expect(reports.length).toBe(1)
    })

    test('should report message mentions if-else', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message).toContain('if-else')
    })
  })

  describe('fix functionality', () => {
    function createMockContextWithSource(source: string): {
      context: RuleContext
      reports: ReportDescriptor[]
    } {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => source,
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

    function createConditionalExpressionWithRange(
      test: unknown,
      consequent: unknown,
      alternate: unknown,
      range: [number, number],
    ): unknown {
      return {
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate,
        range,
        loc: {
          start: { line: 1, column: range[0] },
          end: { line: 1, column: range[1] },
        },
      }
    }

    function createIdentifierWithRange(name: string, range: [number, number]): unknown {
      return {
        type: 'Identifier',
        name,
        range,
      }
    }

    function createLiteralWithRange(value: unknown, range: [number, number]): unknown {
      return {
        type: 'Literal',
        value,
        range,
      }
    }

    test('should provide fix for nested ternary in consequent', () => {
      const source = 'x ? y ? 1 : 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('y', [4, 5]),
        createLiteralWithRange(1, [8, 9]),
        createLiteralWithRange(2, [12, 13]),
        [4, 13],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        innerTernary,
        createLiteralWithRange(3, [16, 17]),
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for nested ternary in alternate', () => {
      const source = 'x ? 1 : y ? 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('y', [8, 9]),
        createLiteralWithRange(2, [12, 13]),
        createLiteralWithRange(3, [16, 17]),
        [8, 17],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        createLiteralWithRange(1, [4, 5]),
        innerTernary,
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})

describe('fix functionality', () => {
  function createMockContextWithSource(source: string): {
    context: RuleContext
    reports: ReportDescriptor[]
  } {
    const reports: ReportDescriptor[] = []

    const context: RuleContext = {
      report: (descriptor: ReportDescriptor) => {
        reports.push({
          message: descriptor.message,
          loc: descriptor.loc,
          fix: descriptor.fix,
        })
      },
      getFilePath: () => '/src/file.ts',
      getAST: () => null,
      getSource: () => source,
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

  function createConditionalExpressionWithRange(
    test: unknown,
    consequent: unknown,
    alternate: unknown,
    range: [number, number],
  ): unknown {
    return {
      type: 'ConditionalExpression',
      test,
      consequent,
      alternate,
      range,
      loc: {
        start: { line: 1, column: range[0] },
        end: { line: 1, column: range[1] },
      },
    }
  }

  function createIdentifierWithRange(name: string, range: [number, number]): unknown {
    return {
      type: 'Identifier',
      name,
      range,
    }
  }

  function createLiteralWithRange(value: unknown, range: [number, number]): unknown {
    return {
      type: 'Literal',
      value,
      range,
    }
  }

  test('should provide fix for nested ternary in consequent', () => {
    const source = 'x ? y ? 1 : 2 : 3'
    const { context, reports } = createMockContextWithSource(source)
    const visitor = noNestedTernaryRule.create(context)

    const innerTernary = createConditionalExpressionWithRange(
      createIdentifierWithRange('y', [4, 5]),
      createLiteralWithRange(1, [8, 9]),
      createLiteralWithRange(2, [12, 13]),
      [4, 13],
    )

    const node = createConditionalExpressionWithRange(
      createIdentifierWithRange('x', [0, 1]),
      innerTernary,
      createLiteralWithRange(3, [16, 17]),
      [0, 17],
    )

    visitor.ConditionalExpression(node)

    expect(reports.length).toBe(1)
    expect(reports[0].fix).toBeDefined()
  })

  test('should provide fix for nested ternary in alternate', () => {
    const source = 'x ? 1 : y ? 2 : 3'
    const { context, reports } = createMockContextWithSource(source)
    const visitor = noNestedTernaryRule.create(context)

    const innerTernary = createConditionalExpressionWithRange(
      createIdentifierWithRange('y', [8, 9]),
      createLiteralWithRange(2, [12, 13]),
      createLiteralWithRange(3, [16, 17]),
      [8, 17],
    )

    const node = createConditionalExpressionWithRange(
      createIdentifierWithRange('x', [0, 1]),
      createLiteralWithRange(1, [4, 5]),
      innerTernary,
      [0, 17],
    )

    visitor.ConditionalExpression(node)

    expect(reports.length).toBe(1)
    expect(reports[0].fix).toBeDefined()
  })

  test('should not provide fix when range is missing', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTernaryRule.create(context)

    visitor.ConditionalExpression(
      createConditionalExpression(
        createIdentifier('x'),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
      ),
    )

    expect(reports.length).toBe(1)
    expect(reports[0].fix).toBeUndefined()
  })

  describe('fix functionality', () => {
    function createMockContextWithSource(source: string): {
      context: RuleContext
      reports: ReportDescriptor[]
    } {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => source,
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

    function createConditionalExpressionWithRange(
      test: unknown,
      consequent: unknown,
      alternate: unknown,
      range: [number, number],
    ): unknown {
      return {
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate,
        range,
        loc: {
          start: { line: 1, column: range[0] },
          end: { line: 1, column: range[1] },
        },
      }
    }

    function createIdentifierWithRange(name: string, range: [number, number]): unknown {
      return {
        type: 'Identifier',
        name,
        range,
      }
    }

    function createLiteralWithRange(value: string | number, range: [number, number]): unknown {
      return {
        type: 'Literal',
        value,
        range,
      }
    }

    test('should provide fix for nested ternary in consequent', () => {
      const source = 'x ? y ? 1 : 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const nestedTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('y', [4, 5]),
        createLiteralWithRange(1, [8, 9]),
        createLiteralWithRange(2, [12, 13]),
        [4, 13],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        nestedTernary,
        createLiteralWithRange(3, [16, 17]),
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for nested ternary in alternate', () => {
      const source = 'x ? 1 : y ? 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const nestedTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('y', [8, 9]),
        createLiteralWithRange(2, [12, 13]),
        createLiteralWithRange(3, [16, 17]),
        [8, 17],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        createLiteralWithRange(1, [4, 5]),
        nestedTernary,
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle deeply nested ternary', () => {
      const source = 'a ? b ? c ? 1 : 2 : 3 : 4'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innermostTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('c', [8, 9]),
        createLiteralWithRange(1, [12, 13]),
        createLiteralWithRange(2, [16, 17]),
        [8, 17],
      )

      const middleTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('b', [4, 5]),
        innermostTernary,
        createLiteralWithRange(3, [20, 21]),
        [4, 21],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('a', [0, 1]),
        middleTernary,
        createLiteralWithRange(4, [24, 25]),
        [0, 25],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })
  })
})
