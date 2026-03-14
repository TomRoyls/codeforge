import { describe, test, expect, vi } from 'vitest'
import { noConfusingVoidExpressionRule } from '../../../../src/rules/patterns/no-confusing-void-expression.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'return void foo();',
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

function createVoidExpression(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'void',
    argument,
    prefix: true,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createReturnStatement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createTemplateLiteral(expressions: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: expressions.map(() => ({ type: 'TemplateElement', value: { raw: '', cooked: '' } })),
    expressions,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBinaryExpression(
  left: unknown,
  operator: string,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
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
    raw: String(value),
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-confusing-void-expression rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConfusingVoidExpressionRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noConfusingVoidExpressionRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConfusingVoidExpressionRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noConfusingVoidExpressionRule.meta.fixable).toBeUndefined()
    })

    test('should mention void in description', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.description.toLowerCase()).toContain('void')
    })

    test('should mention confusing in description', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.description.toLowerCase()).toContain(
        'confusing',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(visitor).toHaveProperty('ReturnStatement')
      expect(visitor).toHaveProperty('TemplateLiteral')
      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('return statement detection', () => {
    test('should report void expression in return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Void expression returned')
    })

    test('should report return void 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(0))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report return without void', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement(createIdentifier('foo'))

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('template literal detection', () => {
    test('should report void expression in template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Void expression in template literal')
    })

    test('should report multiple void expressions in template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr1 = createVoidExpression(createIdentifier('foo'))
      const voidExpr2 = createVoidExpression(createIdentifier('bar'))
      const node = createTemplateLiteral([voidExpr1, voidExpr2])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(2)
    })

    test('should not report non-void expressions in template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([createIdentifier('foo'), createLiteral('bar')])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('arithmetic operation detection', () => {
    test('should report void expression on left side of addition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arithmetic operation')
      expect(reports[0].message).toContain('+')
    })

    test('should report void expression on right side of subtraction', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(createLiteral(10), '-', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('-')
    })

    test('should report void expression on both sides of multiplication', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr1 = createVoidExpression(createIdentifier('foo'))
      const voidExpr2 = createVoidExpression(createIdentifier('bar'))
      const node = createBinaryExpression(voidExpr1, '*', voidExpr2)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should report void expression with division', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '/', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void expression with modulo', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '%', createLiteral(3))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void expression with exponentiation', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '**', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report void expression with comparison operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '===', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void expression with logical operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '&&', createLiteral(true))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report normal arithmetic without void', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(5), '+', createLiteral(3))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
    })

    test('should handle null node gracefully for TemplateLiteral', () => {
      const { context } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
    })

    test('should handle null node gracefully for BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.TemplateLiteral(123)).not.toThrow()
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
        prefix: true,
      }
      const node = {
        type: 'ReturnStatement',
        argument: voidExpr,
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 10, 5)
      const node = createReturnStatement(voidExpr, 10, 0)

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention undefined in return message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports[0].message.toLowerCase()).toContain('undefined')
    })

    test('should mention undefined in template literal message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('undefined')
    })

    test('should mention NaN in arithmetic message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('NaN')
    })
  })

  describe('common void patterns', () => {
    test('should report return void fn() (minifier pattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void in string concatenation via template', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report void 0 in arithmetic', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(0))
      const node = createBinaryExpression(voidExpr, '*', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
