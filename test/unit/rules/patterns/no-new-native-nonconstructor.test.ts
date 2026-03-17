import { describe, test, expect, vi } from 'vitest'
import { noNewNativeNonconstructorRule } from '../../../../src/rules/patterns/no-new-native-nonconstructor.js'
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
    getSource: () => 'new Symbol();',
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

function createNewExpression(callee: unknown, line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: 15 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 15 },
    },
  }
}

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-new-native-nonconstructor rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noNewNativeNonconstructorRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noNewNativeNonconstructorRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention constructor in description', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.description.toLowerCase()).toContain(
        'constructor',
      )
    })

    test('should mention non-constructor in description', () => {
      expect(noNewNativeNonconstructorRule.meta.docs?.description.toLowerCase()).toContain(
        'non-constructor',
      )
    })

    test('should have empty schema', () => {
      expect(noNewNativeNonconstructorRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noNewNativeNonconstructorRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with NewExpression method', () => {
      const { context } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('valid constructors', () => {
    test('should not report new with Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Array')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Object', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Object')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Date', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Date')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('RegExp')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Error', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Error')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Map', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Map')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Set', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Set')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Promise')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with custom class', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('MyClass')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report new with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const object = createIdentifier('MyModule')
      const property = createIdentifier('MyClass')
      const callee = createMemberExpression(object, property)
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid non-constructors - Symbol', () => {
    test('should report new Symbol()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Symbol')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
    })

    test('should report new Symbol without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 12 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
    })

    test('should report new Symbol with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
        arguments: [
          {
            type: 'Literal',
            value: 'description',
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
    })

    test('should report correct location for Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Symbol', 10, 5)
      visitor.NewExpression(createNewExpression(callee, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('invalid non-constructors - BigInt', () => {
    test('should report new BigInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('BigInt')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'BigInt' cannot be called as a constructor.")
    })

    test('should report new BigInt without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 12 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'BigInt' cannot be called as a constructor.")
    })

    test('should report new BigInt with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('BigInt'),
        arguments: [
          {
            type: 'Literal',
            value: '9007199254740991',
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("'BigInt' cannot be called as a constructor.")
    })

    test('should report correct location for BigInt', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('BigInt', 15, 8)
      visitor.NewExpression(createNewExpression(callee, 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple new Symbol calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 5, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report multiple new BigInt calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 3, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 7, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed Symbol and BigInt violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 2, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 3, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 4, 0))

      expect(reports.length).toBe(4)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = { type: 'CallExpression', callee: createIdentifier('test') }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Symbol'),
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const object = createIdentifier('obj')
      const property = createIdentifier('Symbol')
      const callee = createMemberExpression(object, property)
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should handle callee with different case', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('symbol')))
      visitor.NewExpression(createNewExpression(createIdentifier('SYMBOL')))
      visitor.NewExpression(createNewExpression(createIdentifier('bigInt')))
      visitor.NewExpression(createNewExpression(createIdentifier('BIGINT')))

      expect(reports.length).toBe(0)
    })

    test('should handle identifier without name', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle identifier with non-string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
          name: 123 as unknown as string,
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle mixed valid and invalid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Symbol'), 2, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Date'), 3, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('BigInt'), 4, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Object'), 5, 0))

      expect(reports.length).toBe(2)
    })
  })

  describe('node types', () => {
    test('should not report CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = createCallExpression(createIdentifier('Symbol'))
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = createMemberExpression(createIdentifier('obj'), createIdentifier('Symbol'))
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = createIdentifier('Symbol')
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'Literal',
        value: 'Symbol',
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('callee variations', () => {
    test('should report with simple Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Symbol')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(1)
    })

    test('should not report with MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const object = createIdentifier('global')
      const property = createIdentifier('Symbol')
      const callee = createMemberExpression(object, property)
      visitor.NewExpression(createNewExpression(callee))

      expect(reports.length).toBe(0)
    })

    test('should not report with computed MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('Symbol'),
          computed: true,
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should report correct message for Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Symbol')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports[0].message).toBe("'Symbol' cannot be called as a constructor.")
    })

    test('should report correct message for BigInt', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('BigInt')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports[0].message).toBe("'BigInt' cannot be called as a constructor.")
    })

    test('should include function name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Symbol')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports[0].message).toContain('Symbol')
    })

    test('should mention constructor in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('BigInt')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports[0].message.toLowerCase()).toContain('constructor')
    })

    test('should mention cannot in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      const callee = createIdentifier('Symbol')
      visitor.NewExpression(createNewExpression(callee))

      expect(reports[0].message.toLowerCase()).toContain('cannot')
    })
  })

  describe('non-constructor variations', () => {
    test('should not report lowercase symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('symbol')))

      expect(reports.length).toBe(0)
    })

    test('should not report uppercase SYMBOL', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('SYMBOL')))

      expect(reports.length).toBe(0)
    })

    test('should not report mixed case SymbOl', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('SymbOl')))

      expect(reports.length).toBe(0)
    })

    test('should not report lowercase bigint', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('bigint')))

      expect(reports.length).toBe(0)
    })

    test('should not report uppercase BIGINT', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewNativeNonconstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('BIGINT')))

      expect(reports.length).toBe(0)
    })
  })
})
