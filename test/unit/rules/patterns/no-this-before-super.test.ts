import { describe, test, expect, vi } from 'vitest'
import { noThisBeforeSuperRule } from '../../../../src/rules/patterns/no-this-before-super.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'constructor() { this.x = 1; }',
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

function createMethodDefinition(kind: string, value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MethodDefinition',
    kind,
    value,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createFunctionExpression(body: unknown[]): unknown {
  return {
    type: 'FunctionExpression',
    body: {
      type: 'BlockStatement',
      body,
      loc: { start: { line: 1, column: 15 }, end: { line: 3, column: 0 } },
    },
  }
}

function createThisExpression(): unknown {
  return {
    type: 'ThisExpression',
  }
}

function createSuperCall(): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Super',
    },
  }
}

function createExpressionStatement(expression: unknown): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
  }
}

describe('no-this-before-super rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noThisBeforeSuperRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noThisBeforeSuperRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noThisBeforeSuperRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noThisBeforeSuperRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noThisBeforeSuperRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noThisBeforeSuperRule.meta.fixable).toBeUndefined()
    })

    test('should mention this in description', () => {
      expect(noThisBeforeSuperRule.meta.docs?.description.toLowerCase()).toContain('this')
    })

    test('should mention super in description', () => {
      expect(noThisBeforeSuperRule.meta.docs?.description.toLowerCase()).toContain('super')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })
  })

  describe('valid constructors (no this before super)', () => {
    test('should not report constructor with super() before this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only super()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createSuperCall())]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only this after super()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report empty constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', createFunctionExpression([])))

      expect(reports.length).toBe(0)
    })

    test('should not report non-constructor method with this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'method',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report method without kind property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const methodDef = {
        type: 'MethodDefinition',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      expect(() => visitor.MethodDefinition(methodDef)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid constructors (this before super)', () => {
    test('should report constructor with this before super()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('this')
      expect(reports[0].message).toContain('super')
    })

    test('should report constructor with only this (no super)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report constructor with this at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report constructor with this without any super()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report constructor with this before super with other statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement({ type: 'Literal', value: 1 }),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition('string')).not.toThrow()
      expect(() => visitor.MethodDefinition(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'ClassProperty',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: null,
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle value without body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: null,
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {},
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'ExpressionStatement',
          },
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body without body array', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
          },
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-array body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: 'not-an-array',
          },
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null statements in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            null,
            createExpressionStatement(createThisExpression()),
            null,
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle non-object statements in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            'string',
            123,
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([
          createExpressionStatement(createThisExpression()),
          createExpressionStatement(createSuperCall()),
        ]),
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
          10,
          5,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
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
        getSource: () => 'constructor() { this.x = 1; }',
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

      const visitor = noThisBeforeSuperRule.create(context)

      expect(() =>
        visitor.MethodDefinition(
          createMethodDefinition(
            'constructor',
            createFunctionExpression([createExpressionStatement(createThisExpression())]),
          ),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention this in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('this')
    })

    test('should mention super in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('super')
    })

    test('should mention not allowed in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('not allowed')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          end: { line: 1, column: 20 },
        },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {},
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })
  })
})
