import { describe, test, expect, vi } from 'vitest'
import { preferSpreadRule } from '../../../../src/rules/patterns/prefer-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'fn.apply(null, args);',
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

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createThisExpression(): unknown {
  return {
    type: 'ThisExpression',
  }
}

describe('prefer-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferSpreadRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferSpreadRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferSpreadRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferSpreadRule.meta.fixable).toBe('code')
    })

    test('should mention spread in description', () => {
      expect(preferSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting .apply() calls', () => {
    test('should report .apply(void, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .apply(this, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createThisExpression(), 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arr.concat()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj.method.apply()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), 'method'),
        'apply',
      )
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 5 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle member expression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Literal', value: 'method' },
        computed: true,
      }
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting .concat() calls', () => {
    test('should report arr.concat(other)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread')
      expect(reports[0].message).toContain('concat')
    })

    test('should report arr.concat(other, more)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [
        createIdentifier('other'),
        createIdentifier('more'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include array name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('myArray'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports[0].message).toContain('myArray')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const node = createCallExpression(createIdentifier('fn'), [createIdentifier('arg')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'push')
      const node = createCallExpression(callee, [createIdentifier('item')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')], 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention spread in apply message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(callee, [createLiteral(null), createIdentifier('args')]),
      )

      expect(reports[0].message.toLowerCase()).toContain('spread')
    })

    test('should mention spread in concat message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports[0].message.toLowerCase()).toContain('spread')
    })
  })

  describe('apply context edge cases', () => {
    test('should not report .apply() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with only one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(null)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report .apply(undefined, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [
        createIdentifier('undefined'),
        createIdentifier('args'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('fn')
    })

    test('should report .apply(this, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createThisExpression(), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report .apply() with object as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createIdentifier('obj'), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with undefined thisArg in arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [undefined, createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('callee object edge cases', () => {
    test('should handle apply on non-Identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getFn'), [])
      const callee = createMemberExpression(innerCall, 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should handle concat on non-Identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getArray'), [])
      const callee = createMemberExpression(innerCall, 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should handle apply with null callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: 'apply' },
      }
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })
  })

  describe('arguments edge cases', () => {
    test('should handle call with undefined arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: undefined as unknown as unknown[],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle concat with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: { type: 'ArrayExpression', elements: [] },
        property: { type: 'Identifier', name: 'concat' },
      }
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })
  })

  describe('extractLocation edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {},
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
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

    function createCallExpressionWithRange(
      callee: unknown,
      args: unknown[],
      range: [number, number],
      line = 1,
      column = 0,
    ): unknown {
      return {
        type: 'CallExpression',
        callee,
        arguments: args,
        range,
        loc: {
          start: { line, column },
          end: { line, column: column + 20 },
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

    function createMemberExpressionWithRange(
      object: unknown,
      property: string,
      range: [number, number],
    ): unknown {
      return {
        type: 'MemberExpression',
        object,
        property: {
          type: 'Identifier',
          name: property,
        },
        range,
      }
    }

    test('should provide fix for fn.apply(null, args)', () => {
      const source = 'fn.apply(null, args)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('fn', [0, 2]),
        'apply',
        [0, 10],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createLiteralWithRange(null, [11, 15]), createIdentifierWithRange('args', [17, 21])],
        [0, 21],
      )

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for arr.concat(other)', () => {
      const source = 'arr.concat(other)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('arr', [0, 3]),
        'concat',
        [0, 9],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createIdentifierWithRange('other', [10, 15])],
        [0, 16],
      )

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not report .apply() with non-null literal as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(42), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with string literal as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [
        createLiteral('not-null'),
        createIdentifier('args'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-Identifier property type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('fn'),
        property: { type: 'Literal', value: 'apply' },
        computed: false,
      }
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with undefined property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('fn'),
        property: undefined as unknown as { type: string; name: string },
      }
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined as unknown as Record<string, unknown>,
        arguments: [createLiteral(null), createIdentifier('args')],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
