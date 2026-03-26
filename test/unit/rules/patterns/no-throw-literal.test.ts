import { describe, test, expect, vi } from 'vitest'
import { noThrowLiteralRule } from '../../../../src/rules/patterns/no-throw-literal.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'throw new Error();',
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
    config: { rules: { 'no-throw-literal': ['error', options] } },
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

function createThrowStatement(argument: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: argument,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 15 },
    },
  }
}

function createStringLiteral(value: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'StringLiteral',
    value: value,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + value.length + 2 },
    },
  }
}

function createNumericLiteral(value: number, lineNumber = 1, column = 0): unknown {
  return {
    type: 'NumericLiteral',
    value: value,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + String(value).length },
    },
  }
}

function createBooleanLiteral(value: boolean, lineNumber = 1, column = 0): unknown {
  return {
    type: 'BooleanLiteral',
    value: value,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + String(value).length },
    },
  }
}

function createNullLiteral(lineNumber = 1, column = 0): unknown {
  return {
    type: 'NullLiteral',
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 4 },
    },
  }
}

function createObjectExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 2 },
    },
  }
}

function createArrayExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 2 },
    },
  }
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
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + calleeName.length + 8 },
    },
  }
}

function createIdentifier(name: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: name,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + name.length },
    },
  }
}

function createTemplateLiteral(value: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [{ type: 'TemplateElement', value: { raw: value, cooked: value } }],
    expressions: [],
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + value.length + 2 },
    },
  }
}

function createRegExpLiteral(pattern: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'RegExpLiteral',
    pattern: pattern,
    flags: '',
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + pattern.length + 2 },
    },
  }
}

function createBigIntLiteral(value: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'BigIntLiteral',
    value: value,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + value.length },
    },
  }
}

function createThisExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ThisExpression',
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 4 },
    },
  }
}

describe('no-throw-literal rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noThrowLiteralRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noThrowLiteralRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noThrowLiteralRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noThrowLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noThrowLiteralRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noThrowLiteralRule.meta.fixable).toBeUndefined()
    })

    test('should mention throwing in description', () => {
      const desc = noThrowLiteralRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/throw/)
    })

    test('should mention Error in description', () => {
      const desc = noThrowLiteralRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/error/)
    })

    test('should have empty schema array', () => {
      expect(noThrowLiteralRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with ThrowStatement method', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(visitor).toHaveProperty('ThrowStatement')
    })
  })

  describe('detecting throw with string literals', () => {
    test('should report throw with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error message')))

      expect(reports.length).toBe(1)
    })

    test('should report throw with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('')))

      expect(reports.length).toBe(1)
    })

    test('should report throw with multi-line string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('multi\nline')))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))

      expect(reports[0].message).toBe('Expected an error object to be thrown.')
    })
  })

  describe('detecting throw with numeric literals', () => {
    test('should report throw with numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))

      expect(reports.length).toBe(1)
    })

    test('should report throw with negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(-1)))

      expect(reports.length).toBe(1)
    })

    test('should report throw with zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should report throw with decimal number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(3.14)))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with boolean literals', () => {
    test('should report throw with true', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should report throw with false', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with null literal', () => {
    test('should report throw with null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNullLiteral()))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with object expression', () => {
    test('should report throw with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createObjectExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report throw with object properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const obj = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'message' },
            value: { type: 'StringLiteral', value: 'error' },
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(obj))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with array expression', () => {
    test('should report throw with empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createArrayExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report throw with array elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const arr = {
        type: 'ArrayExpression',
        elements: [{ type: 'StringLiteral', value: 'error' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(arr))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with template literal', () => {
    test('should report throw with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createTemplateLiteral('error message')))

      expect(reports.length).toBe(1)
    })

    test('should report throw with empty template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createTemplateLiteral('')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with RegExp literal', () => {
    test('should report throw with RegExp literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createRegExpLiteral('pattern')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with BigInt literal', () => {
    test('should report throw with BigInt literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBigIntLiteral('42n')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with this expression', () => {
    test('should report throw with this expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createThisExpression()))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid throw statements', () => {
    test('should not report throw with new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new TypeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('TypeError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new RangeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('RangeError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with error variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createIdentifier('errorVar')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getError' },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(call))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'error' },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(member))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const conditional = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'condition' },
        consequent: createIdentifier('error1'),
        alternate: createIdentifier('error2'),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(conditional))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const logical = {
        type: 'LogicalExpression',
        operator: '||',
        left: createIdentifier('error1'),
        right: createIdentifier('error2'),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(logical))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const binary = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('error1'),
        right: createIdentifier('error2'),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(binary))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('errorVar'),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(unary))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const awaitExp = {
        type: 'AwaitExpression',
        argument: createIdentifier('errorPromise'),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(awaitExp))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null throw statement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined throw statement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement('string')).not.toThrow()
      expect(() => visitor.ThrowStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle throw statement without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
        },
      }
      visitor.ThrowStatement(throwStmt)

      expect(reports.length).toBe(0)
    })

    test('should handle throw statement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ThrowStatement(throwStmt)

      expect(reports.length).toBe(0)
    })

    test('should handle throw statement with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: undefined,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ThrowStatement(throwStmt)

      expect(reports.length).toBe(0)
    })

    test('should handle argument without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const arg = { value: 'some value' }
      visitor.ThrowStatement(createThrowStatement(arg))

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: createStringLiteral('error'),
      }
      visitor.ThrowStatement(throwStmt)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle empty rule config', () => {
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
        getSource: () => 'throw "error";',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error'), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42), 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('message quality', () => {
    test('should mention error in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))

      expect(reports[0].message).toContain('error')
    })

    test('should mention thrown in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))

      expect(reports[0].message).toContain('thrown')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))

      expect(reports[0].message).toBe('Expected an error object to be thrown.')
      expect(reports[1].message).toBe('Expected an error object to be thrown.')
    })

    test('should be actionable message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true)))

      expect(reports[0].message).toMatch(/Expected|should|must/i)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple throw literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error1')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))
      visitor.ThrowStatement(createThrowStatement(createObjectExpression()))

      expect(reports.length).toBe(3)
    })

    test('should report only literals, not valid throws', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))
      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(123)))
      visitor.ThrowStatement(createThrowStatement(createIdentifier('errorVar')))

      expect(reports.length).toBe(2)
    })
  })
})
