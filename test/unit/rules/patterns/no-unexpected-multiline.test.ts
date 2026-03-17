import { describe, test, expect, vi } from 'vitest'
import { noUnexpectedMultilineRule } from '../../../../src/rules/patterns/no-unexpected-multiline.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'a + b;',
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

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createTemplateLiteral(line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [
      {
        type: 'TemplateElement',
        value: { raw: 'text', cooked: 'text' },
        tail: true,
      },
    ],
    expressions: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createCallExpression(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'func' },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-unexpected-multiline rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnexpectedMultilineRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnexpectedMultilineRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnexpectedMultilineRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnexpectedMultilineRule.meta.fixable).toBeUndefined()
    })

    test('should mention multiline in description', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.description.toLowerCase()).toContain('multiline')
    })

    test('should mention expressions in description', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.description.toLowerCase()).toContain(
        'expressions',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('valid cases - non-template literals', () => {
    test('should not report addition of two identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction of two identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report addition with literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createIdentifier('a'), createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction with literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-', createIdentifier('a'), createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report addition with call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createCallExpression(), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction with call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createCallExpression(), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - other operators', () => {
    test('should not report multiplication', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report division', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report equality', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report inequality', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report less than', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('<', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report greater than', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('>', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report logical and', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('&&', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report logical or', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('||', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases - addition with template literals', () => {
    test('should report addition with template literal on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report addition with template literal on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report addition with template literals on both sides', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report addition with template literal and literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createLiteral(5)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report addition with template literal and call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createCallExpression(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid cases - subtraction with template literals', () => {
    test('should report subtraction with template literal on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createIdentifier('b')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report subtraction with template literal on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report subtraction with template literals on both sides', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should report subtraction with template literal and literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createLiteral(5)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report subtraction with template literal and call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createCallExpression(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node', () => {
      const { context } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node', () => {
      const { context } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when left is undefined and right is template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral(), 10, 5),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

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
        getSource: () => 'a + b;',
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

      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() =>
        visitor.BinaryExpression(
          createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('a')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('b'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle consecutive violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('a')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('c')),
      )

      expect(reports.length).toBe(3)
    })
  })

  describe('message quality', () => {
    test('should include multiline in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('multiline')
    })

    test('should include unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should include expression in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('expression')
    })
  })
})
