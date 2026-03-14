import { describe, test, expect, vi } from 'vitest'
import { noConstantConditionRule } from '../../../../src/rules/patterns/no-constant-condition.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'if (true) {}',
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

// Helper functions to create AST nodes
function createIfStatement(test: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test,
    consequent: { type: 'BlockStatement', body: [] },
    alternate: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createWhileStatement(test: unknown, line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createForStatement(test: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test,
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createDoWhileStatement(test: unknown, line = 1, column = 0): unknown {
  return {
    type: 'DoWhileStatement',
    test,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'BooleanLiteral',
    value,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createNumericLiteral(value: number): unknown {
  return {
    type: 'NumericLiteral',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
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

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
  }
}

describe('no-constant-condition rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConstantConditionRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noConstantConditionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noConstantConditionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConstantConditionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConstantConditionRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noConstantConditionRule.meta.fixable).toBe('code')
    })

    test('should mention constant condition in description', () => {
      expect(noConstantConditionRule.meta.docs?.description.toLowerCase()).toContain('constant')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('DoWhileStatement')
    })
  })

  describe('if statement - valid cases', () => {
    test('should not report variable condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createIdentifier('x'))

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function call condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createCallExpression(createIdentifier('isReady')))

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(
        createBinaryExpression('>', createIdentifier('x'), createLiteral(5)),
      )

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report comparison with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(
        createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
      )

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('if statement - invalid cases', () => {
    test('should report if (true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report if (false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(false))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report if (1) - truthy number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(1))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report if (0) - falsy number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(0))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('should report if (-1) - truthy negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(-1))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report if ("non-empty") - truthy string', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral('non-empty'))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report if ("") - falsy empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(''))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('should report if (null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(null))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
      expect(reports[0].message).toContain('null')
    })
  })

  describe('while statement', () => {
    test('should not report while (condition) with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createIdentifier('running'))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report while (true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createBooleanLiteral(true))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report while (false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createBooleanLiteral(false))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report while (1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createNumericLiteral(1))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report while (0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createNumericLiteral(0))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })
  })

  describe('for statement', () => {
    test('should not report for with variable condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(
        createBinaryExpression('<', createIdentifier('i'), createLiteral(10)),
      )

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report for with true condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createBooleanLiteral(true))

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report for with false condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createBooleanLiteral(false))

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report for with numeric condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createNumericLiteral(1))

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })
  })

  describe('do-while statement', () => {
    test('should not report do-while with variable condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createIdentifier('shouldContinue'))

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report do-while (true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createBooleanLiteral(true))

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report do-while (false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createBooleanLiteral(false))

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report do-while with numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createNumericLiteral(42))

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })
  })

  describe('Literal type (not BooleanLiteral)', () => {
    test('should report Literal with boolean true value', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(true))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report Literal with boolean false value', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(false))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report Literal with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(100))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal with zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(0))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('should report Literal with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral('hello'))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
      expect(reports[0].message).toContain('string')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without test property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with incomplete loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createBooleanLiteral(true),
        loc: {},
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle test node that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test node that is a primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: 'primitive string',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true), 5, 10)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for while statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createBooleanLiteral(true), 10, 5)

      visitor.WhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for for statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createBooleanLiteral(true), 15, 8)

      visitor.ForStatement(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for do-while statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createBooleanLiteral(true), 20, 12)

      visitor.DoWhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(12)
    })
  })

  describe('message quality', () => {
    test('should mention "constant condition" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].message.toLowerCase()).toContain('constant condition')
    })

    test('should mention "always" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].message.toLowerCase()).toContain('always')
    })

    test('should include value in message for truthy number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(42)))

      expect(reports[0].message).toContain('42')
    })

    test('should include value in message for falsy number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(0)))

      expect(reports[0].message).toContain('0')
    })
  })

  describe('various numeric literals', () => {
    test('should report floating point number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(3.14))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report negative floating point number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(-0.5))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report very large number', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(999999999))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })
  })

  describe('config handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

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
        getSource: () => 'if (true) {}',
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

      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('complex expressions (should not trigger)', () => {
    test('should not report logical expression with variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Identifier', name: 'prop' },
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report unary expression with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('x'),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'ConditionalExpression',
        test: createIdentifier('a'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })
})
