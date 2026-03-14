import { describe, test, expect, vi } from 'vitest'
import { noSameSideConditionsRule } from '../../../../src/rules/patterns/no-same-side-conditions.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'a && a',
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'BooleanLiteral',
    value,
  }
}

function createNumericLiteral(value: number): unknown {
  return {
    type: 'NumericLiteral',
    value,
  }
}

function createStringLiteral(value: string): unknown {
  return {
    type: 'StringLiteral',
    value,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
  }
}

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
  }
}

function createLogicalExpression(
  operator: string,
  left: unknown,
  right: unknown,
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

describe('no-same-side-conditions rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSameSideConditionsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noSameSideConditionsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noSameSideConditionsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSameSideConditionsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noSameSideConditionsRule.meta.schema).toBeDefined()
      expect(noSameSideConditionsRule.meta.schema).toEqual([])
    })

    test('should be fixable', () => {
      expect(noSameSideConditionsRule.meta.fixable).toBe('code')
    })

    test('should mention same side conditions in description', () => {
      expect(noSameSideConditionsRule.meta.docs?.description.toLowerCase()).toContain('both sides')
    })

    test('should mention redundant in description', () => {
      expect(noSameSideConditionsRule.meta.docs?.description.toLowerCase()).toContain('redundant')
    })
  })

  describe('create', () => {
    test('should return visitor object with LogicalExpression method', () => {
      const { context } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
      expect(typeof visitor.LogicalExpression).toBe('function')
    })
  })

  describe('AND operator (&&) - same side detection', () => {
    test('should report a && a', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
      expect(reports[0].message).toContain('identical')
      expect(reports[0].message).toContain('redundant')
    })

    test('should report foo && foo', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('foo'), createIdentifier('foo'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report true && true', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(true),
        createBooleanLiteral(true),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report false && false', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(false),
        createBooleanLiteral(false),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report 1 && 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createNumericLiteral(1), createNumericLiteral(1))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report "test" && "test"', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createStringLiteral('test'),
        createStringLiteral('test'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })
  })

  describe('OR operator (||) - same side detection', () => {
    test('should report a || a', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
      expect(reports[0].message).toContain('identical')
      expect(reports[0].message).toContain('redundant')
    })

    test('should report x || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('x'), createIdentifier('x'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report true || true', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createBooleanLiteral(true),
        createBooleanLiteral(true),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report false || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createBooleanLiteral(false),
        createBooleanLiteral(false),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })

    test('should report 0 || 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createNumericLiteral(0), createNumericLiteral(0))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })
  })

  describe('member expressions - same side detection', () => {
    test('should report obj.prop && obj.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report data.value || data.value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('data'), createIdentifier('value'))
      const right = createMemberExpression(createIdentifier('data'), createIdentifier('value'))
      const node = createLogicalExpression('||', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })
  })

  describe('call expressions - same side detection', () => {
    test('should report func() && func()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('func'))
      const right = createCallExpression(createIdentifier('func'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AND')
    })

    test('should report getData() || getData()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('getData'))
      const right = createCallExpression(createIdentifier('getData'))
      const node = createLogicalExpression('||', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OR')
    })
  })

  describe('valid cases - different sides', () => {
    test('should not report a && b', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x || y', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('x'), createIdentifier('y'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report true && false', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 1 && 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createNumericLiteral(1), createNumericLiteral(0))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "a" && "b"', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createStringLiteral('a'), createStringLiteral('b'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.prop && obj.other', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('other'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report func1() && func2()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const left = createCallExpression(createIdentifier('func1'))
      const right = createCallExpression(createIdentifier('func2'))
      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('non-logical expressions', () => {
    test('should not report binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '==',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with operator other than && or ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '??',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      expect(() => visitor.LogicalExpression('string')).not.toThrow()
      expect(() => visitor.LogicalExpression(123)).not.toThrow()
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with incomplete loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: {},
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle complex expressions that cannot be compared', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const left = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }
      const right = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left,
        right,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle nested member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const left = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('inner')),
        createIdentifier('prop'),
      )
      const right = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('inner')),
        createIdentifier('prop'),
      )

      const node = createLogicalExpression('&&', left, right)
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for AND operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createIdentifier('a'),
        createIdentifier('a'),
        5,
        10,
      )

      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for OR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createIdentifier('x'),
        createIdentifier('x'),
        10,
        5,
      )

      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('message quality', () => {
    test('should mention operator type in message for AND', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message).toContain('AND')
    })

    test('should mention operator type in message for OR', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message).toContain('OR')
    })

    test('should mention "identical" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('identical')
    })

    test('should mention "redundant" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('redundant')
    })
  })

  describe('Literal type (SWC compatibility)', () => {
    test('should detect same Literal with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral(true), createLiteral(true))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect same Literal with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral(42), createLiteral(42))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect same Literal with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('||', createLiteral('test'), createLiteral('test'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report different Literal values', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createLiteral('a'), createLiteral('b'))
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('SWC-specific literals', () => {
    test('should detect same BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createBooleanLiteral(true),
        createBooleanLiteral(true),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect same NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createNumericLiteral(100),
        createNumericLiteral(100),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect same StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '||',
        createStringLiteral('hello'),
        createStringLiteral('hello'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report different StringLiteral values', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression(
        '&&',
        createStringLiteral('foo'),
        createStringLiteral('bar'),
      )
      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('config handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noSameSideConditionsRule.create(context)

      const node = createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a'))
      visitor.LogicalExpression(node)

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
        getSource: () => 'a && a',
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

      const visitor = noSameSideConditionsRule.create(context)

      expect(() =>
        visitor.LogicalExpression(
          createLogicalExpression('&&', createIdentifier('a'), createIdentifier('a')),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('operator variations', () => {
    test('should not report ?? operator (nullish coalescing)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '??',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other logical operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noSameSideConditionsRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '^',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }

      visitor.LogicalExpression?.(node)

      expect(reports.length).toBe(0)
    })
  })
})
