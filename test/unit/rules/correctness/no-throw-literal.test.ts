import { describe, test, expect, vi } from 'vitest'
import { noThrowLiteralRule } from '../../../../src/rules/correctness/no-throw-literal.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'throw "error";',
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

function createThrowStatement(
  argumentType: string,
  value?: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: argumentType,
      value,
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'Identifier',
      name,
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowObject(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'ObjectExpression',
      properties: [],
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowArray(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'ArrayExpression',
      elements: [],
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowNewError(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'NewExpression',
      callee: {
        type: 'Identifier',
        name: 'Error',
      },
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowTSAsExpression(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'TSAsExpression',
      expression: {
        type: 'Literal',
        value: 'error',
      },
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createTextNode(text: string, line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    text,
    loc: {
      start: { line, column },
      end: { line, column: column + text.length },
    },
  }
}

function createThrowCallExpression(calleeName: string, line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: calleeName },
      arguments: [],
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createThrowNewExpression(calleeName: string, line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: calleeName },
      arguments: [],
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createThrowMemberExpression(
  objectName: string,
  propertyName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createThrowConditionalExpression(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'ConditionalExpression',
      test: { type: 'Identifier', name: 'cond' },
      consequent: {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [],
      },
      alternate: {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'TypeError' },
        arguments: [],
      },
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createThrowUnaryExpression(operator: string, line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'UnaryExpression',
      operator,
      argument: { type: 'Literal', value: 1 },
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createThrowAwaitExpression(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getError' },
        arguments: [],
      },
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createThrowAssignmentExpression(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'err' },
      right: {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [],
      },
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createThrowObjectWithProperties(
  properties: Array<{ key: string; value: string }>,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'ObjectExpression',
      properties: properties.map((p) => ({
        type: 'Property',
        key: { type: 'Identifier', name: p.key },
        value: { type: 'Literal', value: p.value },
      })),
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createThrowArrayWithElements(elements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'ArrayExpression',
      elements: elements.map((el) => ({ type: 'Literal', value: el })),
      loc: { start: { line, column }, end: { line, column: column + 10 } },
    },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
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

    test('should have correctness category', () => {
      expect(noThrowLiteralRule.meta.docs?.category).toBe('correctness')
    })

    test('should have schema defined', () => {
      expect(noThrowLiteralRule.meta.schema).toBeDefined()
    })

    test('should mention throw in description', () => {
      expect(noThrowLiteralRule.meta.docs?.description.toLowerCase()).toContain('throw')
    })
  })

  describe('create', () => {
    test('should return visitor object with ThrowStatement method', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(visitor).toHaveProperty('ThrowStatement')
    })
  })

  describe('detecting thrown literals', () => {
    test('should report thrown string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error message'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string')
    })

    test('should report thrown number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 42))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number')
    })

    test('should report thrown null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should report thrown undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowIdentifier('undefined'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('should report thrown boolean literal (true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should report thrown boolean literal (false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should report thrown object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowObject())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('object')
    })

    test('should report thrown array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowArray())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })
  })

  describe('allowing valid throws', () => {
    test('should not report thrown Error object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowNewError())

      expect(reports.length).toBe(0)
    })

    test('should not report thrown identifier other than undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowIdentifier('myError'))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowThrowingObjects', () => {
    test('should allow thrown objects when option is true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowObject())

      expect(reports.length).toBe(0)
    })

    test('should still report thrown strings even when allowThrowingObjects is true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowThrowingAny', () => {
    test('should allow thrown TSAsExpression when option is true', () => {
      const { context, reports } = createMockContext({ allowThrowingAny: true })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowTSAsExpression())

      expect(reports.length).toBe(0)
    })

    test('should still report thrown strings when allowThrowingAny is false', () => {
      const { context, reports } = createMockContext({ allowThrowingAny: false })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement('string')).not.toThrow()
      expect(() => visitor.ThrowStatement(123)).not.toThrow()
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const node = { type: 'ThrowStatement' }

      expect(() => visitor.ThrowStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const node = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'error' },
      }

      expect(() => visitor.ThrowStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))

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
        getSource: () => 'throw "error";',
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

      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(createThrowStatement('Literal', 'error'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const node = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'error' },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.ThrowStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle thrown bigint literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', BigInt(123)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('bigint')
    })

    test('should handle thrown regexp literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', /test/))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('RegExp')
    })
  })

  describe('message quality', () => {
    test('should mention Error object in string message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))

      expect(reports[0].message.toLowerCase()).toContain('error')
    })

    test('should mention Error object in number message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 42))

      expect(reports[0].message.toLowerCase()).toContain('error')
    })

    test('should mention Error object in null message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', null))

      expect(reports[0].message.toLowerCase()).toContain('error')
    })

    test('should mention Error object in object message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowObject())

      expect(reports[0].message.toLowerCase()).toContain('error')
    })
  })

  describe('throwing strings - expanded', () => {
    test('should report empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', ''))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string')
    })

    test('should report single character string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'a'))
      expect(reports.length).toBe(1)
    })

    test('should report multi-word string message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'something went wrong'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string')
    })

    test('should report string with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'error: \n\t'))
      expect(reports.length).toBe(1)
    })

    test('should report string with unicode characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', '\u00e9rror'))
      expect(reports.length).toBe(1)
    })

    test('should report string via StringLiteral type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('StringLiteral', 'error'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string')
    })

    test('should report string with newline characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'line1\nline2'))
      expect(reports.length).toBe(1)
    })

    test('should report long error message string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'a'.repeat(500)))
      expect(reports.length).toBe(1)
    })

    test('should report string with escape sequences', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'path\\to\\file'))
      expect(reports.length).toBe(1)
    })

    test('should report string at specific line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'err', 42, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report string at specific column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'err', 1, 15))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report string with tab characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', '\tindented'))
      expect(reports.length).toBe(1)
    })

    test('should report string with emoji characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', '\u{1F6D1} error'))
      expect(reports.length).toBe(1)
    })

    test('should report string with mixed content', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(
        createThrowStatement('Literal', 'Error 404: path/to/resource not found'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report string with only whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', '   '))
      expect(reports.length).toBe(1)
    })
  })

  describe('throwing numbers - expanded', () => {
    test('should report zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 0))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number')
    })

    test('should report negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', -1))
      expect(reports.length).toBe(1)
    })

    test('should report positive float', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 3.14))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number')
    })

    test('should report negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', -99.99))
      expect(reports.length).toBe(1)
    })

    test('should report very large number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 1e10))
      expect(reports.length).toBe(1)
    })

    test('should report very small decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 0.001))
      expect(reports.length).toBe(1)
    })

    test('should report integer one', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 1))
      expect(reports.length).toBe(1)
    })

    test('should report negative one', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', -1))
      expect(reports.length).toBe(1)
    })

    test('should report number at specific line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 42, 25, 0))
      expect(reports[0].loc?.start.line).toBe(25)
    })

    test('should report number at specific column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 42, 1, 8))
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('throwing null - expanded', () => {
    test('should report null with message containing null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', null))
      expect(reports[0].message).toContain('null')
    })

    test('should report null at different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', null, 50, 0))
      expect(reports[0].loc?.start.line).toBe(50)
    })

    test('should report null at different column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', null, 1, 20))
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report null with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', null))
      expect(reports.length).toBe(1)
    })

    test('should report null with allowThrowingObjects true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', null))
      expect(reports.length).toBe(1)
    })
  })

  describe('throwing undefined - expanded', () => {
    test('should report undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('undefined'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('should report undefined at different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('undefined', 30, 0))
      expect(reports[0].loc?.start.line).toBe(30)
    })

    test('should report undefined at different column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('undefined', 1, 12))
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report undefined with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('undefined'))
      expect(reports.length).toBe(1)
    })

    test('should not report identifier that starts with undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('undefinedVar'))
      expect(reports.length).toBe(0)
    })
  })

  describe('throwing booleans - expanded', () => {
    test('should report true with boolean in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', true))
      expect(reports[0].message).toContain('boolean')
    })

    test('should report false with boolean in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', false))
      expect(reports[0].message).toContain('boolean')
    })

    test('should report boolean at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', true, 7, 3))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('throwing objects - expanded', () => {
    test('should report empty object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObject())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('object')
    })

    test('should report object with properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObjectWithProperties([{ key: 'message', value: 'error' }]))
      expect(reports.length).toBe(1)
    })

    test('should report object with multiple properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(
        createThrowObjectWithProperties([
          { key: 'message', value: 'error' },
          { key: 'code', value: '500' },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report ObjectLiteralExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: {
          type: 'ObjectLiteralExpression',
          properties: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ThrowStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('object')
    })

    test('should report object at different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObject(15, 0))
      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should report object at different column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObject(1, 6))
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report object with nested properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(
        createThrowObjectWithProperties([
          { key: 'error', value: 'nested' },
          { key: 'data', value: 'info' },
          { key: 'status', value: '404' },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report object with allowThrowingAny true', () => {
      const { context, reports } = createMockContext({ allowThrowingAny: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObject())
      expect(reports.length).toBe(1)
    })
  })

  describe('throwing arrays - expanded', () => {
    test('should report empty array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArray())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should report array with elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArrayWithElements(['a', 'b']))
      expect(reports.length).toBe(1)
    })

    test('should report ArrayLiteralExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: {
          type: 'ArrayLiteralExpression',
          elements: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ThrowStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should report array at different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArray(20, 0))
      expect(reports[0].loc?.start.line).toBe(20)
    })

    test('should report array at different column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArray(1, 4))
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report array with string elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArrayWithElements(['err1', 'err2']))
      expect(reports.length).toBe(1)
    })

    test('should report array with number elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArrayWithElements([1, 2, 3]))
      expect(reports.length).toBe(1)
    })

    test('should report array with mixed elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArrayWithElements(['msg', 404, true]))
      expect(reports.length).toBe(1)
    })
  })

  describe('throwing regexp - expanded', () => {
    test('should report regex with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', /test/gi))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('RegExp')
    })

    test('should report regex without flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', /pattern/))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('RegExp')
    })

    test('should report complex regex pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', /^[a-z]+$/))
      expect(reports.length).toBe(1)
    })
  })

  describe('not flagging - Error objects', () => {
    test('should not report new TypeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('TypeError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new RangeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('RangeError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new SyntaxError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('SyntaxError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new ReferenceError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('ReferenceError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new URIError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('URIError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new EvalError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('EvalError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new AggregateError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('AggregateError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new CustomError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('CustomError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new AppError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('AppError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new HttpError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('HttpError'))
      expect(reports.length).toBe(0)
    })

    test('should not report new Error at different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewError(99, 0))
      expect(reports.length).toBe(0)
    })

    test('should not report new Error at different column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewError(1, 50))
      expect(reports.length).toBe(0)
    })

    test('should not report new Error with options', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewError())
      expect(reports.length).toBe(0)
    })
  })

  describe('not flagging - variables', () => {
    test('should not report identifier named err', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('err'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named error', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('error'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named myError', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('myError'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named e', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('e'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named exception', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('exception'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named ex', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('ex'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named customErr', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('customErr'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named NotFoundError', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('NotFoundError'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named result', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('result'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier named value', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('value'))
      expect(reports.length).toBe(0)
    })
  })

  describe('not flagging - function calls', () => {
    test('should not report throw getError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('getError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw createError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('createError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw buildError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('buildError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw makeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('makeError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw generateError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('generateError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw fetchError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('fetchError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw Error() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('Error'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw TypeError() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('TypeError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('fn'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw callback()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('callback'))
      expect(reports.length).toBe(0)
    })
  })

  describe('not flagging - other expressions', () => {
    test('should not report throw member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowMemberExpression('errors', 'NotFound'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowConditionalExpression())
      expect(reports.length).toBe(0)
    })

    test('should not report throw unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowUnaryExpression('void'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowAssignmentExpression())
      expect(reports.length).toBe(0)
    })

    test('should not report throw await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowAwaitExpression())
      expect(reports.length).toBe(0)
    })
  })

  describe('text-based detection', () => {
    test('should detect thrown string from text with single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode("throw 'error';"))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string')
    })

    test('should detect thrown string from text with double quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw "error";'))
      expect(reports.length).toBe(1)
    })

    test('should detect thrown string from text with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw `error`;'))
      expect(reports.length).toBe(1)
    })

    test('should detect thrown number from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw 42;'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number')
    })

    test('should detect thrown negative number from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw -1;'))
      expect(reports.length).toBe(1)
    })

    test('should detect thrown float from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw 3.14;'))
      expect(reports.length).toBe(1)
    })

    test('should detect thrown null from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw null;'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should detect thrown undefined from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw undefined;'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('should detect thrown true from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw true;'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should detect thrown false from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw false;'))
      expect(reports.length).toBe(1)
    })

    test('should detect thrown regex from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw /test/;'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('RegExp')
    })

    test('should detect thrown object from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw {};'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('object')
    })

    test('should detect thrown array from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw [];'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should not flag throw new Error() from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw new Error("msg");'))
      expect(reports.length).toBe(0)
    })

    test('should not flag throw identifier from text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw myError;'))
      expect(reports.length).toBe(0)
    })
  })

  describe('allowThrowingObjects option - expanded', () => {
    test('should allow thrown empty objects with option true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObject())
      expect(reports.length).toBe(0)
    })

    test('should allow thrown objects with properties when option true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObjectWithProperties([{ key: 'msg', value: 'err' }]))
      expect(reports.length).toBe(0)
    })

    test('should still report strings with allowThrowingObjects true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))
      expect(reports.length).toBe(1)
    })

    test('should still report numbers with allowThrowingObjects true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 42))
      expect(reports.length).toBe(1)
    })

    test('should still report null with allowThrowingObjects true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', null))
      expect(reports.length).toBe(1)
    })

    test('should still report undefined with allowThrowingObjects true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('undefined'))
      expect(reports.length).toBe(1)
    })

    test('should still report booleans with allowThrowingObjects true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', true))
      expect(reports.length).toBe(1)
    })

    test('should still report arrays with allowThrowingObjects true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArray())
      expect(reports.length).toBe(1)
    })

    test('should still report regexps with allowThrowingObjects true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', /test/))
      expect(reports.length).toBe(1)
    })

    test('should report objects when allowThrowingObjects is false', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: false })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObject())
      expect(reports.length).toBe(1)
    })
  })

  describe('violation messages - expanded', () => {
    test('should have correct exact message for string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'err'))
      expect(reports[0].message).toBe(
        'Throwing string literals is not allowed. Throw an Error object instead.',
      )
    })

    test('should have correct exact message for number type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 42))
      expect(reports[0].message).toBe(
        'Throwing number literals is not allowed. Throw an Error object instead.',
      )
    })

    test('should have correct exact message for null type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', null))
      expect(reports[0].message).toBe(
        'Throwing null is not allowed. Throw an Error object instead.',
      )
    })

    test('should have correct exact message for undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('undefined'))
      expect(reports[0].message).toBe(
        'Throwing undefined is not allowed. Throw an Error object instead.',
      )
    })

    test('should have correct exact message for boolean type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', true))
      expect(reports[0].message).toBe(
        'Throwing boolean literals is not allowed. Throw an Error object instead.',
      )
    })

    test('should have correct exact message for bigint type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', BigInt(100)))
      expect(reports[0].message).toBe(
        'Throwing bigint literals is not allowed. Throw an Error object instead.',
      )
    })

    test('should have correct exact message for regexp type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', /test/))
      expect(reports[0].message).toBe(
        'Throwing RegExp literals is not allowed. Throw an Error object instead.',
      )
    })

    test('should have correct exact message for object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObject())
      expect(reports[0].message).toBe(
        'Throwing plain objects is not recommended. Throw an Error object instead.',
      )
    })

    test('should have correct exact message for array type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArray())
      expect(reports[0].message).toBe(
        'Throwing array literals is not allowed. Throw an Error object instead.',
      )
    })

    test('should mention Error object in all messages', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const { context: ctx3, reports: r3 } = createMockContext()
      const v1 = noThrowLiteralRule.create(ctx1)
      const v2 = noThrowLiteralRule.create(ctx2)
      const v3 = noThrowLiteralRule.create(ctx3)
      v1.ThrowStatement(createThrowStatement('Literal', 's'))
      v2.ThrowStatement(createThrowStatement('Literal', 1))
      v3.ThrowStatement(createThrowStatement('Literal', true))
      expect(r1[0].message).toContain('Error object')
      expect(r2[0].message).toContain('Error object')
      expect(r3[0].message).toContain('Error object')
    })
  })

  describe('violation properties', () => {
    test('should include loc in string report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'e', 3, 5))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should include loc in number report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 1, 4, 2))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(4)
    })

    test('should include loc in null report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', null, 5, 0))
      expect(reports[0].loc).toBeDefined()
    })

    test('should include loc in boolean report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', false, 6, 1))
      expect(reports[0].loc).toBeDefined()
    })

    test('should include loc in object report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowObject(7, 2))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should include loc in array report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowArray(8, 3))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should include loc in undefined report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('undefined', 9, 4))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(9)
    })

    test('should include loc in bigint report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', BigInt(1), 10, 0))
      expect(reports[0].loc).toBeDefined()
    })

    test('should include loc in regexp report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', /r/, 11, 0))
      expect(reports[0].loc).toBeDefined()
    })

    test('should preserve start and end positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'x', 2, 4))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('edge cases - expanded', () => {
    test('should handle node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      const node = { type: 'ThrowStatement' }
      expect(() => visitor.ThrowStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      const node = { type: 'ThrowStatement', argument: null }
      expect(() => visitor.ThrowStatement(node)).not.toThrow()
    })

    test('should handle node with empty string text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode(''))
      expect(reports.length).toBe(0)
    })

    test('should handle node with whitespace-only text', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('   '))
      expect(reports.length).toBe(0)
    })

    test('should handle node with text "throw ;"', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw ;'))
      expect(reports.length).toBe(0)
    })

    test('should handle node with text "throw" (no value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createTextNode('throw'))
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'err' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        extra: true,
        range: [0, 10],
      }
      visitor.ThrowStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle repeated calls with same node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      const node = createThrowStatement('Literal', 'err')
      visitor.ThrowStatement(node)
      visitor.ThrowStatement(node)
      visitor.ThrowStatement(node)
      expect(reports.length).toBe(3)
    })

    test('should handle config with null options array element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noThrowLiteralRule.create(context)
      expect(() => visitor.ThrowStatement(createThrowStatement('Literal', 'err'))).not.toThrow()
    })

    test('should handle very long string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'x'.repeat(10000)))
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple violations from different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'str'))
      visitor.ThrowStatement(createThrowStatement('Literal', 42))
      expect(reports.length).toBe(2)
    })

    test('should report string then number then null violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'str'))
      visitor.ThrowStatement(createThrowStatement('Literal', 42))
      visitor.ThrowStatement(createThrowStatement('Literal', null))
      expect(reports.length).toBe(3)
    })

    test('should report all literal types in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'str'))
      visitor.ThrowStatement(createThrowStatement('Literal', 42))
      visitor.ThrowStatement(createThrowStatement('Literal', null))
      visitor.ThrowStatement(createThrowIdentifier('undefined'))
      visitor.ThrowStatement(createThrowStatement('Literal', true))
      visitor.ThrowStatement(createThrowObject())
      visitor.ThrowStatement(createThrowArray())
      expect(reports.length).toBe(7)
    })

    test('should count violations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.ThrowStatement(createThrowStatement('Literal', `err${i}`))
      }
      expect(reports.length).toBe(5)
    })

    test('should track locations for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'a', 1, 0))
      visitor.ThrowStatement(createThrowStatement('Literal', 'b', 2, 5))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should report same violation type multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'err1'))
      visitor.ThrowStatement(createThrowStatement('Literal', 'err2'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('string')
      expect(reports[1].message).toContain('string')
    })

    test('should handle mix of valid and invalid throws', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewError())
      visitor.ThrowStatement(createThrowStatement('Literal', 'bad'))
      visitor.ThrowStatement(createThrowIdentifier('myErr'))
      visitor.ThrowStatement(createThrowObject())
      expect(reports.length).toBe(2)
    })

    test('should report all violations even with many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      for (let i = 0; i < 20; i++) {
        visitor.ThrowStatement(createThrowStatement('Literal', i))
      }
      expect(reports.length).toBe(20)
    })

    test('should maintain correct message order', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'str'))
      visitor.ThrowStatement(createThrowStatement('Literal', 42))
      expect(reports[0].message).toContain('string')
      expect(reports[1].message).toContain('number')
    })

    test('should not accumulate state between visitor calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowStatement('Literal', 'err'))
      expect(reports.length).toBe(1)
      visitor.ThrowStatement(createThrowNewError())
      expect(reports.length).toBe(1)
    })
  })

  describe('valid code - extended', () => {
    test('should not report throw new Error with message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewError())
      expect(reports.length).toBe(0)
    })

    test('should not report throw new TypeError with message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('TypeError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw err variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('err'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw myError variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowIdentifier('myError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw getError() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('getError'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw this.error member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowMemberExpression('this', 'error'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw errors.NotFound member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowMemberExpression('errors', 'NotFound'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowConditionalExpression())
      expect(reports.length).toBe(0)
    })

    test('should not report throw await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowAwaitExpression())
      expect(reports.length).toBe(0)
    })

    test('should not report throw assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowAssignmentExpression())
      expect(reports.length).toBe(0)
    })

    test('should not report throw unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowUnaryExpression('void'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw new CustomErrorClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowNewExpression('CustomErrorClass'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw call expression with any callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowCallExpression('anyFunction'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw member expression with chained access', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowMemberExpression('module', 'export'))
      expect(reports.length).toBe(0)
    })

    test('should not report throw TSAsExpression with allowThrowingAny', () => {
      const { context, reports } = createMockContext({ allowThrowingAny: true })
      const visitor = noThrowLiteralRule.create(context)
      visitor.ThrowStatement(createThrowTSAsExpression())
      expect(reports.length).toBe(0)
    })
  })
})
