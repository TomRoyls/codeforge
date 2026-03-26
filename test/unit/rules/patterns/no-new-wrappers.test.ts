import { describe, test, expect, vi } from 'vitest'
import { noNewWrappersRule } from '../../../../src/rules/patterns/no-new-wrappers.js'
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

function createNewExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 10 },
    },
  }
}

function createCallExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 10 },
    },
  }
}

describe('no-new-wrappers rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noNewWrappersRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noNewWrappersRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noNewWrappersRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noNewWrappersRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noNewWrappersRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noNewWrappersRule.meta.fixable).toBeUndefined()
    })

    test('should mention new in description', () => {
      expect(noNewWrappersRule.meta.docs?.description.toLowerCase()).toContain('new')
    })

    test('should mention wrappers in description', () => {
      const desc = noNewWrappersRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/string|number|boolean|symbol|bigint|wrapper/)
    })

    test('should have empty schema array', () => {
      expect(noNewWrappersRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with NewExpression method', () => {
      const { context } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('detecting new String()', () => {
    test('should report new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message).toBe('Do not use new String(). Use string() or a literal instead.')
    })

    test('should mention string() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message).toContain('string()')
    })
  })

  describe('detecting new Number()', () => {
    test('should report new Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports[0].message).toBe('Do not use new Number(). Use number() or a literal instead.')
    })

    test('should mention number() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports[0].message).toContain('number()')
    })
  })

  describe('detecting new Boolean()', () => {
    test('should report new Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports[0].message).toBe(
        'Do not use new Boolean(). Use boolean() or a literal instead.',
      )
    })

    test('should mention boolean() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports[0].message).toContain('boolean()')
    })
  })

  describe('detecting new Symbol()', () => {
    test('should report new Symbol()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new Symbol()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol'))

      expect(reports[0].message).toBe('Do not use new Symbol(). Use symbol() or a literal instead.')
    })

    test('should mention symbol() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol'))

      expect(reports[0].message).toContain('symbol()')
    })
  })

  describe('detecting new BigInt()', () => {
    test('should report new BigInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new BigInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt'))

      expect(reports[0].message).toBe('Do not use new BigInt(). Use bigint() or a literal instead.')
    })

    test('should mention bigint() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt'))

      expect(reports[0].message).toContain('bigint()')
    })
  })

  describe('not reporting non-wrapper constructors', () => {
    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Date'))
      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Object'))
      visitor.NewExpression(createNewExpression('Map'))

      expect(reports.length).toBe(0)
    })

    test('should not report user-defined constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('UserClass'))
      visitor.NewExpression(createNewExpression('CustomType'))

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting String(), Number(), Boolean() without new', () => {
    test('should not report String() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('CustomConstructor'))

      expect(reports.length).toBe(0)
    })

    test('should not report Number() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('CustomConstructor'))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('CustomConstructor'))

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple new wrapper expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 1, 0))
      visitor.NewExpression(createNewExpression('Number', 2, 0))
      visitor.NewExpression(createNewExpression('Boolean', 3, 0))
      visitor.NewExpression(createNewExpression('Symbol', 4, 0))
      visitor.NewExpression(createNewExpression('BigInt', 5, 0))

      expect(reports.length).toBe(5)
    })

    test('should report mixed violations and non-violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Date'))
      visitor.NewExpression(createNewExpression('Number'))
      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports.length).toBe(3)
    })

    test('should report same wrapper multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 1, 0))
      visitor.NewExpression(createNewExpression('String', 2, 0))
      visitor.NewExpression(createNewExpression('String', 3, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        callee: {
          type: 'Identifier',
          name: 'String',
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

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
        getSource: () => 'new String()',
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

      const visitor = noNewWrappersRule.create(context)
      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for wrapper expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
          name: 'String',
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('message quality', () => {
    test('should contain "Do not use new" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message).toContain('Do not use new')
    })

    test('should contain wrapper name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message).toContain('String')
    })

    test('should suggest lowercase function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports[0].message).toContain('boolean()')
    })

    test('should suggest literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports[0].message).toContain('literal')
    })

    test('should have consistent message format for all wrappers', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Number'))
      visitor.NewExpression(createNewExpression('Boolean'))
      visitor.NewExpression(createNewExpression('Symbol'))
      visitor.NewExpression(createNewExpression('BigInt'))

      for (const report of reports) {
        expect(report.message).toMatch(
          /Do not use new [A-Z][a-zA-Z]+\(\)\. Use [a-z]+\(\) or a literal instead\./,
        )
      }
    })
  })
})
