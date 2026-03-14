import { describe, test, expect, vi } from 'vitest'
import { curlyRule } from '../../../../src/rules/patterns/curly.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'if (x) y;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createIfStatement(
  consequent: unknown,
  line = 1,
  column = 0,
  range?: [number, number],
): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'Identifier',
      name: 'x',
    },
    consequent,
    alternate: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
    range: range ?? [column, column + 20],
  }
}

function createForStatement(
  body: unknown,
  line = 1,
  column = 0,
  range?: [number, number],
): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: null,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
    range: range ?? [column, column + 20],
  }
}

function createWhileStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: {
      type: 'Identifier',
      name: 'x',
    },
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createDoWhileStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'DoWhileStatement',
    body,
    test: {
      type: 'Identifier',
      name: 'x',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createWithStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'WithStatement',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBlockStatement(line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createExpressionStatement(line = 1, column = 0, range?: [number, number]): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Identifier',
      name: 'y',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
    range: range ?? [column, column + 10],
  }
}

describe('curly rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(curlyRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(curlyRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(curlyRule.meta.docs?.recommended).toBe(true)
    })

    test('should have style category', () => {
      expect(curlyRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(curlyRule.meta.schema).toBeDefined()
    })

    test('should be code fixable', () => {
      expect(curlyRule.meta.fixable).toBe('code')
    })

    test('should mention curly braces in description', () => {
      expect(curlyRule.meta.docs?.description.toLowerCase()).toContain('curly')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(visitor).toHaveProperty('DoWhileStatement')
      expect(visitor).toHaveProperty('WithStatement')
    })
  })

  describe('if statements', () => {
    test('should report if without curly braces', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement())
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'if' statement.")
    })

    test('should not report if with block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createBlockStatement())
      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report if with nested if without braces', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const innerIf = createIfStatement(createExpressionStatement(), 2, 4)
      const node = createIfStatement(innerIf, 1, 0)

      visitor.IfStatement(node)
      visitor.IfStatement(innerIf)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("Expected { after 'if' statement.")
      expect(reports[1].message).toContain("Expected { after 'if' statement.")
    })

    test('should handle if with else clause without braces', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createBlockStatement(),
        alternate: createExpressionStatement(),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 5, column: 0 },
        },
      }

      visitor.IfStatement(node)

      // The rule only checks the consequent, not the alternate
      expect(reports.length).toBe(0)
    })

    test('should handle null if statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined if statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle if statement without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('for statements', () => {
    test('should report for without curly braces', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement(createExpressionStatement())
      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'for' statement.")
    })

    test('should not report for with block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement(createBlockStatement())
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report for with single expression', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'console.log(x)' },
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 25 } },
      })
      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle null for statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.ForStatement(null)).not.toThrow()
    })

    test('should handle undefined for statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.ForStatement(undefined)).not.toThrow()
    })
  })

  describe('while statements', () => {
    test('should report while without curly braces', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement(createExpressionStatement())
      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'while' statement.")
    })

    test('should not report while with block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement(createBlockStatement())
      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null while statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.WhileStatement(null)).not.toThrow()
    })

    test('should handle undefined while statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.WhileStatement(undefined)).not.toThrow()
    })
  })

  describe('do-while statements', () => {
    test('should report do-while without curly braces', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement(createExpressionStatement())
      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'do' statement.")
    })

    test('should not report do-while with block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement(createBlockStatement())
      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null do-while statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.DoWhileStatement(null)).not.toThrow()
    })

    test('should handle undefined do-while statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.DoWhileStatement(undefined)).not.toThrow()
    })
  })

  describe('with statements', () => {
    test('should report with without curly braces', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement(createExpressionStatement())
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'with' statement.")
    })

    test('should not report with with block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement(createBlockStatement())
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null with statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.WithStatement(null)).not.toThrow()
    })

    test('should handle undefined with statement', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.WithStatement(undefined)).not.toThrow()
    })
  })

  describe('edge cases', () => {
    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
      expect(() => visitor.ForStatement('string')).not.toThrow()
      expect(() => visitor.WhileStatement(123)).not.toThrow()
    })

    test('should report correct location for if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement(), 10, 5)
      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for for statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement(createExpressionStatement(), 5, 10)
      visitor.ForStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for while statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement(createExpressionStatement(), 8, 3)
      visitor.WhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))

      expect(reports.length).toBe(1)
    })

    test('should handle statement with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: null,
        alternate: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.IfStatement(node)

      // Should report because null is not a BlockStatement
      expect(reports.length).toBe(1)
    })

    test('should handle statement with undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.IfStatement(node)

      // Should report because undefined is not a BlockStatement
      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 20 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {},
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should include keyword in message', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))

      expect(reports[0].message).toContain("'if'")
    })

    test('should mention expected braces in message', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      visitor.ForStatement(createForStatement(createExpressionStatement()))

      expect(reports[0].message).toContain('Expected {')
    })

    test('should have correct message for all statement types', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      visitor.ForStatement(createForStatement(createExpressionStatement(), 2))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement(), 3))
      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement(), 4))
      visitor.WithStatement(createWithStatement(createExpressionStatement(), 5))

      expect(reports[0].message).toContain("'if'")
      expect(reports[1].message).toContain("'for'")
      expect(reports[2].message).toContain("'while'")
      expect(reports[3].message).toContain("'do'")
      expect(reports[4].message).toContain("'with'")
    })
  })

  describe('fix', () => {
    test('should provide fix for if statement without braces', () => {
      const source = 'if (x) y;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = curlyRule.create(context)

      const bodyNode = createExpressionStatement(1, 7, [7, 8])
      const node = createIfStatement(bodyNode, 1, 0, [0, 12])
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([7, 8])
      expect(reports[0].fix?.text).toBe('{ y }')
    })

    test('should provide fix for for statement without braces', () => {
      const source = 'for (;;) y;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = curlyRule.create(context)

      const bodyNode = createExpressionStatement(1, 9, [9, 10])
      const node = createForStatement(bodyNode, 1, 0)
      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{ y }')
    })

    test('should provide fix for while statement without braces', () => {
      const source = 'while (x) y;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = curlyRule.create(context)

      const bodyNode = createExpressionStatement(1, 10, [10, 11])
      const node = createWhileStatement(bodyNode, 1, 0)
      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{ y }')
    })

    test('should not provide fix when body has no range', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const bodyNode = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 8 } },
      }
      const node = createIfStatement(bodyNode, 1, 0)
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createBlockStatement())
      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not provide fix when bodySource is empty', () => {
      const source = ''
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = curlyRule.create(context)

      const bodyNode = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 8 } },
        range: [7, 8] as [number, number],
      }
      const node = createIfStatement(bodyNode, 1, 0)
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})
