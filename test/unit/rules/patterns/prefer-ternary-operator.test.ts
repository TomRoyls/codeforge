import { describe, test, expect, vi } from 'vitest'
import { preferTernaryOperatorRule } from '../../../../src/rules/patterns/prefer-ternary-operator.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = a || b;',
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

function createIfStatement(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createExpressionStatement(expression: unknown): unknown {
  return { type: 'ExpressionStatement', expression }
}

function createAssignmentExpression(left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
  }
}

function createBlockStatement(body: unknown[]): unknown {
  return { type: 'BlockStatement', body }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

describe('prefer-ternary-operator rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferTernaryOperatorRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferTernaryOperatorRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferTernaryOperatorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have style category', () => {
      expect(preferTernaryOperatorRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(preferTernaryOperatorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferTernaryOperatorRule.meta.fixable).toBe('code')
    })

    test('should mention ternary operator in description', () => {
      expect(preferTernaryOperatorRule.meta.docs?.description.toLowerCase()).toContain('ternary')
    })

    test('should mention if-else in description', () => {
      expect(preferTernaryOperatorRule.meta.docs?.description).toContain('if-else')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
    })
  })

  describe('detecting simple if-else assignments', () => {
    test('should report simple if-else with same variable assignment in expression statements', () => {
      const source = 'if (condition) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ternary')
      expect(reports[0].message).toContain('x')
    })

    test('should report if-else with block statements containing single assignment', () => {
      const source = 'if (condition) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
      ])
      const alternate = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
      ])

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ternary')
    })

    test('should report if-else with mixed block and expression statements', () => {
      const source = 'if (condition) { x = 1; } else x = 2;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
      ])
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
    })

    test('should report if-else with variable expressions', () => {
      const source = 'if (condition) { x = a; } else { x = b; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('a')),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('b')),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(
        createIfStatement(createIdentifier('condition'), consequent, alternate, 10, 5),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('patterns that should NOT be reported', () => {
    test('should not report if-else without alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, null))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else without consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), null, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with different variable assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with multiple statements in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
        ),
      ])
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with multiple statements in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('y'), createLiteral(3)),
        ),
      ])

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else without assignment in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(createIdentifier('console.log'))
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else without assignment in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(createIdentifier('console.log'))

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with non-assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(createIdentifier('doSomething'))
      const alternate = createExpressionStatement(createIdentifier('doSomethingElse'))

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with empty block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createBlockStatement([])
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('result'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('result'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports[0].message).toContain('result')
    })

    test('should mention ternary operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports[0].message).toContain('ternary')
    })

    test('should mention if-else in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports[0].message).toContain('if-else')
    })

    test('should mention simple assignment in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports[0].message).toContain('assignment')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle if statement without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent,
        alternate,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report even without test (rule still detects pattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      const node = {
        type: 'IfStatement',
        consequent,
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without consequent property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without alternate property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle block statement with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'BlockStatement', body: null }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle block statement with undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'BlockStatement' }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle expression statement without expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'ExpressionStatement' }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment expression with different operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('x'),
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createLiteral(2),
      })

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment expression with non-identifier left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression' },
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression' },
        right: createLiteral(2),
      })

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

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
        getSource: () => 'const x = a || b;',
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

      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
