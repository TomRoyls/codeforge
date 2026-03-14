import { describe, test, expect, vi } from 'vitest'
import { noDuplicateElseIfRule } from '../../../../src/rules/patterns/no-duplicate-else-if.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'if (x) {} else if (x) {}',
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createBlockStatement(statements: unknown[] = []): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createEmptyBlock(): unknown {
  return createBlockStatement([])
}

function createIfStatement(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBinaryExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }
}

describe('no-duplicate-else-if rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDuplicateElseIfRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDuplicateElseIfRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDuplicateElseIfRule.meta.docs?.recommended).toBe(true)
    })

    test('should have logic category', () => {
      expect(noDuplicateElseIfRule.meta.docs?.category).toBe('logic')
    })

    test('should have schema defined', () => {
      expect(noDuplicateElseIfRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noDuplicateElseIfRule.meta.fixable).toBeUndefined()
    })

    test('should mention duplicate in description', () => {
      expect(noDuplicateElseIfRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })

    test('should mention if-else chain in description', () => {
      expect(noDuplicateElseIfRule.meta.docs?.description.toLowerCase()).toContain('if-else')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
      expect(visitor).toHaveProperty('Program:exit')
    })
  })

  describe('detecting duplicate conditions', () => {
    test('should report duplicate identifier conditions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate condition')
    })

    test('should report duplicate literal conditions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral(5), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createLiteral(5), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report duplicate binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createBinaryExpression('>', createIdentifier('x'), createLiteral(10))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report multiple duplicate conditions in same chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const conditionA = createIdentifier('a')
      const conditionB = createIdentifier('b')

      const thirdIf = createIfStatement(conditionA, createEmptyBlock(), null, 5, 5)
      const secondIf = createIfStatement(conditionB, createEmptyBlock(), thirdIf, 3, 5)
      const firstIf = createIfStatement(conditionA, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor.IfStatement(thirdIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('line 1')
    })

    test('should report second occurrence location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 10, 8)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should reference first occurrence line in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 10, 8)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 5, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).toContain('line 5')
    })
  })

  describe('not detecting duplicates', () => {
    test('should not report different conditions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createIdentifier('y'), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report single if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const singleIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 1, 0)

      visitor.IfStatement(singleIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report if without alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const singleIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null)

      visitor.IfStatement(singleIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const condition1 = createBinaryExpression('>', createIdentifier('x'), createLiteral(10))
      const condition2 = createBinaryExpression('>', createIdentifier('x'), createLiteral(20))

      const secondIf = createIfStatement(condition2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(condition1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const condition1 = createBinaryExpression('>', createIdentifier('x'), createLiteral(10))
      const condition2 = createBinaryExpression('<', createIdentifier('x'), createLiteral(10))

      const secondIf = createIfStatement(condition2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(condition1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }
      const mainIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: duplicateIf,
      }

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

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
        getSource: () => 'if (x) {} else if (x) {}',
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

      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      expect(() => {
        visitor.IfStatement(mainIf)
        visitor.IfStatement(duplicateIf)
        visitor['Program:exit']()
      }).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-if alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const elseBlock = createBlockStatement([{ type: 'ReturnStatement' }])
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), elseBlock, 1, 0)

      visitor.IfStatement(mainIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle node without test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        consequent: createEmptyBlock(),
        alternate: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should only process each chain once', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention duplicate in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message.toLowerCase()).toContain('duplicate')
    })

    test('should mention if-else chain in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message.toLowerCase()).toContain('if-else chain')
    })

    test('should mention the line number of first occurrence', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 10, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 5, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).toContain('line 5')
    })
  })

  describe('edge cases', () => {
    test('should handle IfStatement with non-IfStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }

      expect(() => {
        visitor.IfStatement(node)
        visitor['Program:exit']()
      }).not.toThrow()
    })

    test('should handle alternate that is not an IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateElseIfRule.create(context)

      const mainIf = createIfStatement(
        createIdentifier('x'),
        createEmptyBlock(),
        {
          type: 'BlockStatement',
          body: [],
        },
        1,
        0,
      )

      expect(() => {
        visitor.IfStatement(mainIf)
        visitor['Program:exit']()
      }).not.toThrow()
    })
  })
})
