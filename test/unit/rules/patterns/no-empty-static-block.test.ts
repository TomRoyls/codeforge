import { describe, test, expect, vi } from 'vitest'
import { noEmptyStaticBlockRule } from '../../../../src/rules/patterns/no-empty-static-block.js'
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
    getSource: () => 'class A { static {} }',
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

function createEmptyStaticBlock(line = 1, column = 0): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNonEmptyStaticBlock(line = 1, column = 0): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 'hello' },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createStaticBlockWithMultipleStatements(line = 1, column = 0): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'x' },
              init: { type: 'Literal', value: 1 },
            },
          ],
        },
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 2 },
          },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createStaticBlockWithCommentOnly(): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createNonStaticBlock(): unknown {
  return {
    type: 'ClassBody',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithoutBody(): unknown {
  return {
    type: 'StaticBlock',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithNullBody(): unknown {
  return {
    type: 'StaticBlock',
    body: null,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithStringBody(): unknown {
  return {
    type: 'StaticBlock',
    body: 'not a block statement',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithEmptyArrayBody(): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithNullBodyProperty(): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: null,
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithNonArrayBody(): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: { type: 'NotAnArray' },
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-empty-static-block rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEmptyStaticBlockRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEmptyStaticBlockRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEmptyStaticBlockRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noEmptyStaticBlockRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention empty static block in description', () => {
      expect(noEmptyStaticBlockRule.meta.docs?.description.toLowerCase()).toContain('empty')
      expect(noEmptyStaticBlockRule.meta.docs?.description.toLowerCase()).toContain('static')
    })

    test('should have empty schema', () => {
      expect(noEmptyStaticBlockRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noEmptyStaticBlockRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with StaticBlock method', () => {
      const { context } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(visitor).toHaveProperty('StaticBlock')
    })

    test('should return object with only StaticBlock method', () => {
      const { context } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(Object.keys(visitor)).toEqual(['StaticBlock'])
    })

    test('should have function as StaticBlock method', () => {
      const { context } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(typeof visitor.StaticBlock).toBe('function')
    })
  })

  describe('detecting empty static blocks', () => {
    test('should report empty static block', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty static block')
    })

    test('should not report non-empty static block with one statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createNonEmptyStaticBlock())

      expect(reports.length).toBe(0)
    })

    test('should not report non-empty static block with multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createStaticBlockWithMultipleStatements())

      expect(reports.length).toBe(0)
    })

    test('should report static block with no statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createStaticBlockWithCommentOnly())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for empty static block', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message).toBe('Unexpected empty static block.')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(undefined)).not.toThrow()
    })

    test('should handle non-StaticBlock node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createNonStaticBlock())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithoutBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithNullBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with non-object body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithStringBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with block statement but no body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithEmptyArrayBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with null body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithNullBodyProperty())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with non-array body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithNonArrayBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = createEmptyStaticBlock()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle object without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = { body: { type: 'BlockStatement', body: [] } }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
