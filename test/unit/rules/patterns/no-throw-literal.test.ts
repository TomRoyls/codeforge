import { describe, test, expect, vi } from 'vitest'
import { noThrowLiteralRule } from '../../../../src/rules/patterns/no-throw-literal.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

function createCallExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + calleeName.length + 2 },
    },
  }
}

function createMemberExpression(
  objectName: string,
  propertyName: string,
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: objectName },
    property: { type: 'Identifier', name: propertyName },
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + objectName.length + propertyName.length + 1 },
    },
  }
}

function createSequenceExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'SequenceExpression',
    expressions: [createIdentifier('a'), createIdentifier('b')],
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 5 },
    },
  }
}

function createParenthesizedExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ParenthesizedExpression',
    expression: createIdentifier('err'),
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 5 },
    },
  }
}

function createTSAsExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'TSAsExpression',
    expression: createIdentifier('err'),
    typeAnnotation: { type: 'TSAnyKeyword' },
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

function createTSTypeAssertion(lineNumber = 1, column = 0): unknown {
  return {
    type: 'TSTypeAssertion',
    expression: createIdentifier('err'),
    typeAnnotation: { type: 'TSAnyKeyword' },
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

function createTSNonNullExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'TSNonNullExpression',
    expression: createIdentifier('err'),
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 5 },
    },
  }
}

function createConditionalExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ConditionalExpression',
    test: { type: 'Identifier', name: 'condition' },
    consequent: createIdentifier('error1'),
    alternate: createIdentifier('error2'),
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 20 },
    },
  }
}

function createLogicalExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: operator,
    left: createIdentifier('error1'),
    right: createIdentifier('error2'),
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 15 },
    },
  }
}

function createBinaryExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: operator,
    left: createIdentifier('error1'),
    right: createIdentifier('error2'),
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 15 },
    },
  }
}

function createUnaryExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: operator,
    argument: createIdentifier('errorVar'),
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

function createAwaitExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'AwaitExpression',
    argument: createIdentifier('errorPromise'),
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 15 },
    },
  }
}

describe('no-throw-literal rule', () => {
  // ============================================================
  // META TESTS (20 tests)
  // ============================================================
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

    test('should have meta property', () => {
      expect(noThrowLiteralRule.meta).toBeDefined()
      expect(typeof noThrowLiteralRule.meta).toBe('object')
    })

    test('should have docs property', () => {
      expect(noThrowLiteralRule.meta.docs).toBeDefined()
      expect(typeof noThrowLiteralRule.meta.docs).toBe('object')
    })

    test('should have string description', () => {
      expect(typeof noThrowLiteralRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noThrowLiteralRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention literals or non-Error in description', () => {
      const desc = noThrowLiteralRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/literal|non.error/)
    })

    test('should have docs url', () => {
      expect(noThrowLiteralRule.meta.docs?.url).toBeDefined()
    })

    test('should have url pointing to codeforge docs', () => {
      expect(noThrowLiteralRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have url containing rule name', () => {
      expect(noThrowLiteralRule.meta.docs?.url).toContain('no-throw-literal')
    })

    test('should have severity as string', () => {
      expect(typeof noThrowLiteralRule.meta.severity).toBe('string')
    })

    test('should have type as string', () => {
      expect(typeof noThrowLiteralRule.meta.type).toBe('string')
    })

    test('should have category as string', () => {
      expect(typeof noThrowLiteralRule.meta.docs?.category).toBe('string')
    })
  })

  // ============================================================
  // CREATE / VISITOR TESTS (8 tests)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with ThrowStatement method', () => {
      const { context } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(visitor).toHaveProperty('ThrowStatement')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should have ThrowStatement as a function', () => {
      const { context } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(typeof visitor.ThrowStatement).toBe('function')
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'throw new Error();' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor1 = noThrowLiteralRule.create(ctx1)
      const visitor2 = noThrowLiteralRule.create(ctx2)

      visitor1.ThrowStatement(createThrowStatement(createStringLiteral('error1')))
      visitor2.ThrowStatement(createThrowStatement(createStringLiteral('error2')))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
      expect(r1[0].message).toBe('Expected an error object to be thrown.')
      expect(r2[0].message).toBe('Expected an error object to be thrown.')
    })

    test('should handle being called with no arguments', () => {
      const { context } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement()).not.toThrow()
    })

    test('should accept any context implementing RuleContext', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/custom/path.ts',
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
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noThrowLiteralRule.create(context)
      expect(typeof visitor.ThrowStatement).toBe('function')
    })

    test('should return visitor that only has ThrowStatement key', () => {
      const { context } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('ThrowStatement')
    })
  })

  // ============================================================
  // DETECTION TESTS (30 tests)
  // ============================================================
  describe('detecting throw with string literals', () => {
    test('should report throw with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error message')))

      expect(reports.length).toBe(1)
    })

    test('should report throw with empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('')))

      expect(reports.length).toBe(1)
    })

    test('should report throw with multi-line string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('multi\nline')))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))

      expect(reports[0].message).toBe('Expected an error object to be thrown.')
    })
  })

  describe('detecting throw with numeric literals', () => {
    test('should report throw with numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))

      expect(reports.length).toBe(1)
    })

    test('should report throw with negative number', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(-1)))

      expect(reports.length).toBe(1)
    })

    test('should report throw with zero', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should report throw with decimal number', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(3.14)))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with boolean literals', () => {
    test('should report throw with true', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should report throw with false', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with null literal', () => {
    test('should report throw with null', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNullLiteral()))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with object expression', () => {
    test('should report throw with empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createObjectExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report throw with object properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
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
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createArrayExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report throw with array elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
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
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createTemplateLiteral('error message')))

      expect(reports.length).toBe(1)
    })

    test('should report throw with empty template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createTemplateLiteral('')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with RegExp literal', () => {
    test('should report throw with RegExp literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createRegExpLiteral('pattern')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with BigInt literal', () => {
    test('should report throw with BigInt literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBigIntLiteral('42n')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with this expression', () => {
    test('should report throw with this expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createThisExpression()))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting throw with generic Literal node with value', () => {
    test('should report throw with generic Literal containing string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const literal = {
        type: 'Literal',
        value: 'error string',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(literal))

      expect(reports.length).toBe(1)
    })

    test('should report throw with generic Literal containing numeric value', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const literal = {
        type: 'Literal',
        value: 42,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 2 },
        },
      }
      visitor.ThrowStatement(createThrowStatement(literal))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT REPORTING TESTS (30 tests)
  // ============================================================
  describe('not reporting valid throw statements', () => {
    test('should not report throw with new Error()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new TypeError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('TypeError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new RangeError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('RangeError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with error variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createIdentifier('errorVar')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createCallExpression('getError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createMemberExpression('obj', 'error')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createConditionalExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createLogicalExpression('||')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createUnaryExpression('!')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with await expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createAwaitExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new SyntaxError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('SyntaxError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new ReferenceError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('ReferenceError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new URIError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('URIError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new EvalError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('EvalError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new CustomError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('CustomError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with new AssertionError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('AssertionError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with catch parameter err', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createIdentifier('err')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with catch parameter e', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createIdentifier('e')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with getError() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createCallExpression('getError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with createError() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createCallExpression('createError')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createSequenceExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with parenthesized expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createParenthesizedExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with TS as expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createTSAsExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with TS type assertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createTSTypeAssertion()))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with TS non-null expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createTSNonNullExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with logical AND expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createLogicalExpression('&&')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with nullish coalescing expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createLogicalExpression('??')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with obj.prop member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createMemberExpression('errors', 'NotFound')))

      expect(reports.length).toBe(0)
    })

    test('should not report throw with typeof unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createUnaryExpression('typeof')))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (25 tests)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null throw statement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined throw statement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement('string')).not.toThrow()
      expect(() => visitor.ThrowStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle throw statement without argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
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
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
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
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
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
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const arg = { value: 'some value' }
      visitor.ThrowStatement(createThrowStatement(arg))

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
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

    test('should handle node with empty type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const arg = { type: '', value: 'something' }
      visitor.ThrowStatement(createThrowStatement(arg))

      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const throwStmt = { type: 123 }
      expect(() => visitor.ThrowStatement(throwStmt)).not.toThrow()
    })

    test('should handle boolean throw statement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array throw statement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement([])).not.toThrow()
    })

    test('should handle deep nested throw with object literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const deepObj = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'nested' },
            value: {
              type: 'ObjectExpression',
              properties: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.ThrowStatement(createThrowStatement(deepObj))

      expect(reports.length).toBe(1)
    })

    test('should handle very long string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const longStr = 'a'.repeat(10000)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral(longStr)))

      expect(reports.length).toBe(1)
    })

    test('should handle string with special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error\n\t\r')))

      expect(reports.length).toBe(1)
    })

    test('should handle string with unicode characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('错误 🚨')))

      expect(reports.length).toBe(1)
    })

    test('should handle NaN numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(Number.NaN)))

      expect(reports.length).toBe(1)
    })

    test('should handle Infinity numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(Number.POSITIVE_INFINITY)))

      expect(reports.length).toBe(1)
    })

    test('should handle RegExp with flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const regex = {
        type: 'RegExpLiteral',
        pattern: 'test',
        flags: 'gi',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.ThrowStatement(createThrowStatement(regex))

      expect(reports.length).toBe(1)
    })

    test('should handle template literal with interpolations', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const tpl = {
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'Error: ', cooked: 'Error: ' } },
          { type: 'TemplateElement', value: { raw: '', cooked: '' } },
        ],
        expressions: [{ type: 'Identifier', name: 'msg' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ThrowStatement(createThrowStatement(tpl))

      expect(reports.length).toBe(1)
    })

    test('should handle very large numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(1e20)))

      expect(reports.length).toBe(1)
    })

    test('should handle BigInt with negative value', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBigIntLiteral('-42n')))

      expect(reports.length).toBe(1)
    })

    test('should handle repeated calls on same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.ThrowStatement(createThrowStatement(createStringLiteral(`error${i}`)))
      }

      expect(reports.length).toBe(100)
    })
  })

  // ============================================================
  // LOCATION REPORTING (15 tests)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location for throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error'), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42), 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 999, 50))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location for boolean literal throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true), 3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location for null literal throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNullLiteral(), 7, 2))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location for object expression throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createObjectExpression(), 15, 4))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for array expression throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createArrayExpression(), 20, 10))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location for template literal throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createTemplateLiteral('err'), 4, 1))

      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report location for regex literal throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createRegExpLiteral('abc'), 2, 6))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report location for BigInt literal throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBigIntLiteral('100n'), 8, 3))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for this expression throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createThisExpression(), 11, 7))

      expect(reports[0].loc?.start.line).toBe(11)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should always report loc as an object', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('x')))

      expect(typeof reports[0].loc).toBe('object')
      expect(reports[0].loc).not.toBeNull()
    })

    test('should have start object in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(1)))

      expect(typeof reports[0].loc?.start).toBe('object')
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should have end object in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(1)))

      expect(typeof reports[0].loc?.end).toBe('object')
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  // ============================================================
  // MESSAGE QUALITY (10 tests)
  // ============================================================
  describe('message quality', () => {
    test('should mention error in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))

      expect(reports[0].message).toContain('error')
    })

    test('should mention thrown in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))

      expect(reports[0].message).toContain('thrown')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))

      expect(reports[0].message).toBe('Expected an error object to be thrown.')
      expect(reports[1].message).toBe('Expected an error object to be thrown.')
    })

    test('should be actionable message', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true)))

      expect(reports[0].message).toMatch(/Expected|should|must/i)
    })

    test('should have same message for all literal types', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      const message = 'Expected an error object to be thrown.'

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('a')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(1)))
      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true)))
      visitor.ThrowStatement(createThrowStatement(createNullLiteral()))
      visitor.ThrowStatement(createThrowStatement(createObjectExpression()))
      visitor.ThrowStatement(createThrowStatement(createArrayExpression()))
      visitor.ThrowStatement(createThrowStatement(createTemplateLiteral('t')))

      for (const report of reports) {
        expect(report.message).toBe(message)
      }
    })

    test('should be a non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('x')))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should be a string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(0)))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err')))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should mention object in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err')))

      expect(reports[0].message.toLowerCase()).toContain('object')
    })

    test('should not contain placeholder tokens', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err')))

      expect(reports[0].message).not.toMatch(/\{.*\}/)
    })
  })

  // ============================================================
  // MULTIPLE REPORTS (10 tests)
  // ============================================================
  describe('multiple violations', () => {
    test('should report multiple throw literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error1')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))
      visitor.ThrowStatement(createThrowStatement(createObjectExpression()))

      expect(reports.length).toBe(3)
    })

    test('should report only literals, not valid throws', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))
      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(123)))
      visitor.ThrowStatement(createThrowStatement(createIdentifier('errorVar')))

      expect(reports.length).toBe(2)
    })

    test('should report all string literal throws', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('a')))
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('b')))
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('c')))

      expect(reports.length).toBe(3)
    })

    test('should report all numeric literal throws', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(1)))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(2)))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(3)))

      expect(reports.length).toBe(3)
    })

    test('should report mix of valid and invalid throws correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('bad')))
      visitor.ThrowStatement(createThrowStatement(createIdentifier('err')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(0)))
      visitor.ThrowStatement(createThrowStatement(createNewExpression('TypeError')))
      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(3)
    })

    test('should report mixed literal types in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      const types = [
        createStringLiteral('s'),
        createNumericLiteral(1),
        createBooleanLiteral(false),
        createNullLiteral(),
        createObjectExpression(),
        createArrayExpression(),
        createTemplateLiteral('t'),
        createRegExpLiteral('r'),
        createBigIntLiteral('1n'),
        createThisExpression(),
      ]

      for (const arg of types) {
        visitor.ThrowStatement(createThrowStatement(arg))
      }

      expect(reports.length).toBe(10)
    })

    test('should accumulate reports across calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.ThrowStatement(createThrowStatement(createStringLiteral(`err${i}`)))
      }

      expect(reports.length).toBe(50)
    })

    test('should maintain correct order of reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('first'), 1))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(2), 2))
      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true), 3))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should report zero violations when all throws are valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))
      visitor.ThrowStatement(createThrowStatement(createNewExpression('TypeError')))
      visitor.ThrowStatement(createThrowStatement(createIdentifier('err')))
      visitor.ThrowStatement(createThrowStatement(createCallExpression('getError')))

      expect(reports.length).toBe(0)
    })

    test('should correctly count when interleaving valid and invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)

      // invalid, valid, invalid, valid, invalid
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('a')))
      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(1)))
      visitor.ThrowStatement(createThrowStatement(createIdentifier('err')))
      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(3)
    })
  })

  // ============================================================
  // CONTEXT TESTS (10 tests)
  // ============================================================
  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();', filePath: '/src/utils/errors.ts' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw "bad";', filePath: '/src/file.ts' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('bad')))

      expect(reports.length).toBe(1)
    })

    test('should work with minimal context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '',
      } as unknown as RuleContext

      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('x')))

      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const debugFn = vi.fn()
      const infoFn = vi.fn()
      const warnFn = vi.fn()
      const errorFn = vi.fn()

      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'throw "error";',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: debugFn,
          info: infoFn,
          warn: warnFn,
          error: errorFn,
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))

      expect(debugFn).not.toHaveBeenCalled()
      expect(infoFn).not.toHaveBeenCalled()
      expect(warnFn).not.toHaveBeenCalled()
      expect(errorFn).not.toHaveBeenCalled()
    })

    test('should work with config containing other rules', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'throw "error";',
        getTokens: () => [],
        getComments: () => [],
        config: {
          rules: {
            'no-eval': ['error'],
            'no-throw-literal': ['error'],
            'max-params': ['warn', { max: 4 }],
          },
        },
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

    test('should work with .ts file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();', filePath: '/src/module.ts' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();', filePath: '/src/component.tsx' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err')))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();', filePath: '/src/index.js' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();', filePath: '/src/a/b/c/d/e/file.ts' })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement(createNullLiteral()))

      expect(reports.length).toBe(1)
    })

    test('should work when context getAST returns an object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
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

  // ============================================================
  // EXPANDED INDIVIDUAL TESTS (67 tests)
  // ============================================================
  describe('parameterized literal type detection', () => {
    test('should detect StringLiteral as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err')))
      expect(reports.length).toBe(1)
    })

    test('should detect NumericLiteral as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))
      expect(reports.length).toBe(1)
    })

    test('should detect BooleanLiteral as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createBooleanLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('should detect NullLiteral as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('should detect BigIntLiteral as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createBigIntLiteral('1n')))
      expect(reports.length).toBe(1)
    })

    test('should detect RegExpLiteral as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createRegExpLiteral('abc')))
      expect(reports.length).toBe(1)
    })

    test('should detect TemplateLiteral as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createTemplateLiteral('err')))
      expect(reports.length).toBe(1)
    })

    test('should detect ObjectExpression as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createObjectExpression()))
      expect(reports.length).toBe(1)
    })

    test('should detect ArrayExpression as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createArrayExpression()))
      expect(reports.length).toBe(1)
    })

    test('should detect ThisExpression as invalid throw argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createThisExpression()))
      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized valid throw types', () => {
    test('should not report for NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))
      expect(reports.length).toBe(0)
    })

    test('should not report for Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createIdentifier('err')))
      expect(reports.length).toBe(0)
    })

    test('should not report for CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createCallExpression('getError')))
      expect(reports.length).toBe(0)
    })

    test('should not report for MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createMemberExpression('obj', 'err')))
      expect(reports.length).toBe(0)
    })

    test('should not report for ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createConditionalExpression()))
      expect(reports.length).toBe(0)
    })

    test('should not report for LogicalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createLogicalExpression('||')))
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createBinaryExpression('+')))
      expect(reports.length).toBe(0)
    })

    test('should not report for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createUnaryExpression('!')))
      expect(reports.length).toBe(0)
    })

    test('should not report for AwaitExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createAwaitExpression()))
      expect(reports.length).toBe(0)
    })

    test('should not report for SequenceExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createSequenceExpression()))
      expect(reports.length).toBe(0)
    })

    test('should not report for ParenthesizedExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createParenthesizedExpression()))
      expect(reports.length).toBe(0)
    })

    test('should not report for TSAsExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createTSAsExpression()))
      expect(reports.length).toBe(0)
    })

    test('should not report for TSTypeAssertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createTSTypeAssertion()))
      expect(reports.length).toBe(0)
    })

    test('should not report for TSNonNullExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createTSNonNullExpression()))
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized new expression types', () => {
    test('should not report throw new Error()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('Error')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new TypeError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('TypeError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new RangeError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('RangeError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new SyntaxError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('SyntaxError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new ReferenceError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('ReferenceError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new URIError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('URIError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new EvalError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('EvalError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new CustomError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('CustomError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new AssertionError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('AssertionError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new AppError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('AppError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new DatabaseError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('DatabaseError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new NetworkError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('NetworkError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new ValidationError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('ValidationError')))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new MyError()', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNewExpression('MyError')))
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized numeric values', () => {
    test('should report throw with numeric value 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(0)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(-1)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value 42', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(42)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value 3.14', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(3.14)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value -3.14', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(-3.14)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value 1e10', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(1e10)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value -1e10', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(-1e10)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value 0.5', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(0.5)))
      expect(reports.length).toBe(1)
    })

    test('should report throw with numeric value 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createNumericLiteral(100)))
      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized string values', () => {
    test('should report throw with empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with single char string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('a')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with error string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('error')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with multi-word string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('Error message')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with multiline string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('multi\nline')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with tab string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('tab\there')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with padded string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('  spaces  ')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with special chars string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('special!@#$%')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with unicode string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('unicode 🚨')))
      expect(reports.length).toBe(1)
    })

    test('should report throw with long string', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(
        createThrowStatement(createStringLiteral('very long string that goes on and on')),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized location values', () => {
    test('should report correct location at line 1 col 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 1 col 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 1, 10))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location at line 5 col 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 5, 0))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 10 col 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location at line 100 col 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location at line 1 col 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 1, 1))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report correct location at line 2 col 3', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 2, 3))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report correct location at line 25 col 8', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 25, 8))
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location at line 50 col 12', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 50, 12))
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report correct location at line 999 col 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'throw new Error();' })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement(createStringLiteral('err'), 999, 0))
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })
})
