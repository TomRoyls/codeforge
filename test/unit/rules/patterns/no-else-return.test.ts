import { describe, test, expect, vi } from 'vitest'
import { noElseReturnRule } from '../../../../src/rules/patterns/no-else-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

interface MockNode {
  type: string
  [key: string]: unknown
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'if (x) { return; } else { y(); }',
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

function createIdentifier(name: string): MockNode {
  return {
    type: 'Identifier',
    name,
  }
}

function createReturnStatement(): MockNode {
  return {
    type: 'ReturnStatement',
    argument: null,
  }
}

function createExpressionStatement(): MockNode {
  return {
    type: 'ExpressionStatement',
    expression: createIdentifier('y'),
  }
}

function createBlockStatement(statements: MockNode[] = [], startCol = 0, endCol = 10): MockNode {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line: 1, column: startCol },
      end: { line: 1, column: endCol },
    },
    range: [startCol, endCol],
  }
}

function createBlockStatementWithRange(statements: MockNode[], range: [number, number]): MockNode {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line: 1, column: range[0] },
      end: { line: 1, column: range[1] },
    },
    range,
  }
}

function createIfStatement(
  test: MockNode | null,
  consequent: MockNode,
  alternate: MockNode | null,
  line = 1,
  column = 0,
  endCol = 50,
): MockNode {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: endCol },
    },
    range: [column, endCol],
  }
}

function createIfStatementWithRange(
  test: MockNode | null,
  consequent: MockNode,
  alternate: MockNode | null,
  range: [number, number],
): MockNode {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    loc: {
      start: { line: 1, column: range[0] },
      end: { line: 1, column: range[1] },
    },
    range,
  }
}

describe('no-else-return rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noElseReturnRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noElseReturnRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noElseReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have style category', () => {
      expect(noElseReturnRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(noElseReturnRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noElseReturnRule.meta.fixable).toBe('code')
    })

    test('should mention else in description', () => {
      expect(noElseReturnRule.meta.docs?.description.toLowerCase()).toContain('else')
    })

    test('should mention return in description', () => {
      expect(noElseReturnRule.meta.docs?.description.toLowerCase()).toContain('return')
    })
  })

  describe('create', () => {
    test('should return visitor object with IfStatement method', () => {
      const { context } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
    })
  })

  describe('detecting unnecessary else blocks', () => {
    test('should report else block after return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary else block')
    })

    test('should report else if block after return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement(), null, 1, 25)
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, innerIf)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should report when return is nested in if within consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const innerIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createReturnStatement()]),
        null,
        1,
        10,
      )
      const consequent = createBlockStatement([innerIf])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should report else block when return is in nested if in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([
        createIfStatement(
          createIdentifier('y'),
          createBlockStatement([createReturnStatement()]),
          null,
          1,
          30,
        ),
      ])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should report location of else block', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()], 5, 20)
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
        loc: {
          start: { line: 2, column: 5 },
          end: { line: 2, column: 15 },
        },
        range: [26, 40],
      }
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate, 1, 0)

      visitor.IfStatement(ifStatement)

      expect(reports[0].loc?.start.line).toBe(2)
    })
  })

  describe('not detecting necessary else blocks', () => {
    test('should not report if without else', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, null)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(0)
    })

    test('should not report else block without return in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createExpressionStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(0)
    })

    test('should report if consequent has return statement directly', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(
        createIdentifier('x'),
        createReturnStatement(),
        alternate,
      )

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })
  })

  describe('fix functionality', () => {
    test('should provide fix for else block with single statement', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )

      visitor.IfStatement(ifStatement)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toBeDefined()
      expect(reports[0].fix?.text).toBeDefined()
    })

    test('should provide fix that removes else keyword', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )

      visitor.IfStatement(ifStatement)

      const fix = reports[0].fix
      expect(fix).toBeDefined()
      const removedText = source.slice(fix!.range[0], fix!.range[1])
      expect(removedText).toContain('else')
    })

    test('should provide fix that extracts block content', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )

      visitor.IfStatement(ifStatement)

      const fix = reports[0].fix
      expect(fix?.text).toContain('y()')
    })

    test('should provide fix for else if (non-block alternate)', () => {
      const source = 'if (x) { return; } else if (y) { z(); }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createIfStatementWithRange(
        createIdentifier('y'),
        createBlockStatement(),
        null,
        [24, 40],
      )
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 40],
      )

      visitor.IfStatement(ifStatement)

      expect(reports[0].fix).toBeDefined()
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const node = {
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle non-IfStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty consequent block', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(0)
    })

    test('should handle empty alternate block', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should handle node without consequent', () => {
      const { context } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        alternate: createBlockStatement([createExpressionStatement()]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node without alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: null,
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle alternate without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })
  })

  describe('message quality', () => {
    test('should mention else block in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports[0].message.toLowerCase()).toContain('else')
    })

    test('should mention unnecessary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should mention return in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports[0].message.toLowerCase()).toContain('return')
    })
  })

  describe('deeply nested structures', () => {
    test('should detect return in nested if-else within consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const deeplyNestedReturn = createBlockStatement([createReturnStatement()])
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        deeplyNestedReturn,
        createBlockStatement([createExpressionStatement()]),
        1,
        10,
      )
      const consequent = createBlockStatement([nestedIf])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should detect return in both branches of nested if', () => {
      const { context, reports } = createMockContext()
      const visitor = noElseReturnRule.create(context)

      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createReturnStatement()]),
        createBlockStatement([createReturnStatement()]),
        1,
        10,
      )
      const consequent = createBlockStatement([nestedIf])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })
  })
})
