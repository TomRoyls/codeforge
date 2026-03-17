import { describe, test, expect, vi } from 'vitest'
import { noExtraBooleanCastRule } from '../../../../src/rules/patterns/no-extra-boolean-cast.js'
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
    getSource: () => 'Boolean(Boolean(x))',
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

function createBooleanCall(line = 1, column = 0, argument?: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: argument ? [argument] : [],
    loc: {
      start: { line, column },
      end: { line, column: column + 12 },
    },
  }
}

function createBooleanCallWithIdentifierArg(line = 1, column = 0, argName = 'x'): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'Identifier',
        name: argName,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 + argName.length },
    },
  }
}

function createDoubleBang(line = 1, column = 0, argument?: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: argument || { type: 'Identifier', name: 'x' },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 3 },
    },
  }
}

function createDoubleBangWithBooleanArg(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'Boolean',
        },
        arguments: [
          {
            type: 'Identifier',
            name: 'x',
          },
        ],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 12 },
    },
  }
}

function createNonBooleanCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'String',
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'x',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createSingleBang(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'Identifier',
      name: 'x',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createUnaryExpressionWithNonBangArg(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '-',
      prefix: true,
      argument: {
        type: 'Identifier',
        name: 'x',
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 3 },
    },
  }
}

function createBooleanCallWithNoArgs(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 8 },
    },
  }
}

function createBooleanCallWithMultipleArgs(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      { type: 'Identifier', name: 'x' },
      { type: 'Identifier', name: 'y' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createCallExpressionWithNonIdentifierCallee(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'boolean' },
      computed: false,
    },
    arguments: [{ type: 'Identifier', name: 'x' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNonCallExpression(): unknown {
  return {
    type: 'Literal',
    value: true,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 4 },
    },
  }
}

function createNonUnaryExpression(): unknown {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Literal', value: 1 },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
  }
}

describe('no-extra-boolean-cast rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noExtraBooleanCastRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noExtraBooleanCastRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noExtraBooleanCastRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noExtraBooleanCastRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention boolean in description', () => {
      expect(noExtraBooleanCastRule.meta.docs?.description.toLowerCase()).toContain('boolean')
    })

    test('should mention cast in description', () => {
      expect(noExtraBooleanCastRule.meta.docs?.description.toLowerCase()).toContain('cast')
    })

    test('should have empty schema', () => {
      expect(noExtraBooleanCastRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noExtraBooleanCastRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor with UnaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return object with only CallExpression and UnaryExpression methods', () => {
      const { context } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['CallExpression', 'UnaryExpression'])
    })
  })

  describe('detecting redundant Boolean() calls', () => {
    test('should report Boolean(Boolean(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(1, 15, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report Boolean(!!x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const doubleBang = createDoubleBang(1, 0)
      const boolCall = createBooleanCall(1, 10, doubleBang)

      visitor.CallExpression(boolCall)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should not report Boolean(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithIdentifierArg(1, 0, 'x'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Boolean call', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createNonBooleanCall(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for Boolean(Boolean(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(5, 10, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should not report Boolean() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithNoArgs(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithMultipleArgs(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report call with non-identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createCallExpressionWithNonIdentifierCallee(1, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting redundant double bang with Boolean', () => {
    test('should report !!Boolean(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should not report !!x', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBang(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report !x', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createSingleBang(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report !(-x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithNonBangArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for !!Boolean(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null CallExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined CallExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle null UnaryExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined UnaryExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-CallExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(createNonCallExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-UnaryExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression(createNonUnaryExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle call expression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        arguments: [{ type: 'Identifier', name: 'x' }],
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle call expression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Identifier', name: 'x' }],
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle call expression without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle unary expression without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
      }

      expect(() => visitor.UnaryExpression(unary)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with non-! operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      expect(() => visitor.UnaryExpression(unary)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(1, 15, innerBool) as Record<string, unknown>
      delete outerBool.loc

      expect(() => visitor.CallExpression(outerBool)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node for UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node for both methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(() => visitor.UnaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Boolean call with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraBooleanCastRule.create(context)

      const boolCall = createBooleanCall(1, 0, null)
      expect(() => visitor.CallExpression(boolCall)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
