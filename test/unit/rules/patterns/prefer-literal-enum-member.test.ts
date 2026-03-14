import { describe, test, expect, vi } from 'vitest'
import { preferLiteralEnumMemberRule } from '../../../../src/rules/patterns/prefer-literal-enum-member.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'enum Status { Active = 1 };',
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

function createEnumMember(name: string, initializer: unknown, line = 1, column = 0): unknown {
  return {
    type: 'TSEnumMember',
    id: {
      type: 'Identifier',
      name,
    },
    initializer,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createEnumMemberWithStringId(
  value: string,
  initializer: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'TSEnumMember',
    id: {
      type: 'Literal',
      value,
    },
    initializer,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createBigIntLiteral(value: string): unknown {
  return {
    type: 'BigIntLiteral',
    value,
  }
}

function createTemplateLiteral(quasis: unknown[], expressions: unknown[]): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

function createParenthesizedExpression(expression: unknown): unknown {
  return {
    type: 'ParenthesizedExpression',
    expression,
  }
}

function createBinaryExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
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
    computed: false,
  }
}

function createObjectExpression(): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
  }
}

function createArrayExpression(): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
  }
}

describe('prefer-literal-enum-member rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferLiteralEnumMemberRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferLiteralEnumMemberRule.meta.severity).toBe('warn')
    })

    test('should not be recommended by default', () => {
      expect(preferLiteralEnumMemberRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(preferLiteralEnumMemberRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferLiteralEnumMemberRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferLiteralEnumMemberRule.meta.fixable).toBeUndefined()
    })

    test('should mention literal in description', () => {
      expect(preferLiteralEnumMemberRule.meta.docs?.description.toLowerCase()).toContain('literal')
    })

    test('should mention enum in description', () => {
      expect(preferLiteralEnumMemberRule.meta.docs?.description.toLowerCase()).toContain('enum')
    })
  })

  describe('create', () => {
    test('should return visitor object with TSEnumMember method', () => {
      const { context } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      expect(visitor).toHaveProperty('TSEnumMember')
    })
  })

  describe('valid literal values', () => {
    test('should not report string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Status', createLiteral('active')))

      expect(reports.length).toBe(0)
    })

    test('should not report number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Count', createLiteral(42)))

      expect(reports.length).toBe(0)
    })

    test('should not report zero as literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('None', createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report negative number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Negative', createLiteral(-1)))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Flag', createLiteral(true)))

      expect(reports.length).toBe(0)
    })

    test('should not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Empty', createLiteral(null)))

      expect(reports.length).toBe(0)
    })

    test('should not report BigInt literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('BigNumber', createBigIntLiteral('9007199254740991n')))

      expect(reports.length).toBe(0)
    })

    test('should not report template literal without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Message', createTemplateLiteral([{ value: 'hello' }], [])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with empty expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Path', createTemplateLiteral([{ value: '/api/v1' }], [])),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid unary expressions', () => {
    test('should not report unary minus with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Negative', createUnaryExpression('-', createLiteral(1))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report unary plus with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Positive', createUnaryExpression('+', createLiteral(42))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report bitwise NOT with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('BitwiseNot', createUnaryExpression('~', createLiteral(0))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report logical NOT with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('LogicalNot', createUnaryExpression('!', createLiteral(false))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report nested unary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember(
          'DoubleNegative',
          createUnaryExpression('-', createUnaryExpression('-', createLiteral(1))),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid parenthesized expressions', () => {
    test('should not report parenthesized literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Parenthesized', createParenthesizedExpression(createLiteral(42))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report nested parenthesized expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember(
          'NestedParens',
          createParenthesizedExpression(createParenthesizedExpression(createLiteral(100))),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report parenthesized unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember(
          'ParenUnary',
          createParenthesizedExpression(createUnaryExpression('-', createLiteral(1))),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid computed values', () => {
    test('should report binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember(
          'Computed',
          createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Computed')
      expect(reports[0].message).toContain('literal')
    })

    test('should report identifier reference', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Reference', createIdentifier('someValue')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Reference')
    })

    test('should report function call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('FuncCall', createCallExpression(createIdentifier('getValue'), [])),
      )

      expect(reports.length).toBe(1)
    })

    test('should report member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('Member', createMemberExpression(createIdentifier('Constants'), 'VALUE')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Obj', createObjectExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Arr', createArrayExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report template literal with expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember(
          'TemplateWithExpr',
          createTemplateLiteral([{ value: '' }, { value: '' }], [createIdentifier('name')]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unary expression with disallowed operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('VoidExpr', createUnaryExpression('void', createLiteral(0))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unary expression with non-literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember('UnaryNonLiteral', createUnaryExpression('-', createIdentifier('value'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report parenthesized non-literal expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember(
          'ParenNonLiteral',
          createParenthesizedExpression(createIdentifier('value')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report multiplication', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember(
          'Multiplied',
          createBinaryExpression(createLiteral(2), '*', createLiteral(3)),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('enum member without initializer', () => {
    test('should not report enum member without initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'AutoIncrement',
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report enum member with null initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember({
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'NullInit',
        },
        initializer: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('string literal member id', () => {
    test('should handle string literal as member id with valid initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMemberWithStringId('computed-key', createLiteral(1)))

      expect(reports.length).toBe(0)
    })

    test('should report string literal as member id with computed initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMemberWithStringId('computed-key', createIdentifier('someValue')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('computed-key')
    })
  })

  describe('message quality', () => {
    test('should include member name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(
        createEnumMember(
          'MyMember',
          createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
        ),
      )

      expect(reports[0].message).toContain('MyMember')
    })

    test('should mention literal value in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

      expect(reports[0].message.toLowerCase()).toContain('literal')
    })

    test('should mention computed expression in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

      expect(reports[0].message.toLowerCase()).toContain('computed')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      expect(() => visitor.TSEnumMember(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      expect(() => visitor.TSEnumMember(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      expect(() => visitor.TSEnumMember('string')).not.toThrow()
      expect(() => visitor.TSEnumMember(123)).not.toThrow()
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      const node = {
        type: 'TSEnumMember',
        initializer: createIdentifier('value'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'Test',
        },
        initializer: createIdentifier('value'),
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'Test',
        },
        initializer: createIdentifier('value'),
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle id without type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          name: 'Test',
        },
        initializer: createIdentifier('value'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should handle id with non-Identifier and non-Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          type: 'SomeOtherType',
          name: 'Test',
        },
        initializer: createIdentifier('value'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

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
        getSource: () => 'enum E { A = 1 };',
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

      const visitor = preferLiteralEnumMemberRule.create(context)

      expect(() =>
        visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'))),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle multiple enum members', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Valid', createLiteral(1)))
      visitor.TSEnumMember(createEnumMember('Invalid', createIdentifier('value')))
      visitor.TSEnumMember(createEnumMember('AlsoValid', createLiteral(2)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid')
    })

    test('should handle initializer with undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferLiteralEnumMemberRule.create(context)

      const node = {
        type: 'TSEnumMember',
        id: {
          type: 'Identifier',
          name: 'Test',
        },
        initializer: {
          someProperty: 'value',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSEnumMember(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
