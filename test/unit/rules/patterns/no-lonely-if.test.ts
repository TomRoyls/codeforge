import { describe, test, expect, vi } from 'vitest'
import { noLonelyIfRule } from '../../../../src/rules/patterns/no-lonely-if.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'if (x) {} else if (y) {}',
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

function createBlockStatement(statements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIfStatementWithLocation(
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-lonely-if rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noLonelyIfRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noLonelyIfRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noLonelyIfRule.meta.docs?.recommended).toBe(true)
    })

    test('should have style category', () => {
      expect(noLonelyIfRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(noLonelyIfRule.meta.schema).toBeDefined()
    })

    test('should be code fixable', () => {
      expect(noLonelyIfRule.meta.fixable).toBe('code')
    })

    test('should mention else if in description', () => {
      expect(noLonelyIfRule.meta.docs?.description.toLowerCase()).toContain('else if')
    })

    test('should mention lonely in description', () => {
      expect(noLonelyIfRule.meta.docs?.description.toLowerCase()).toContain('if')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
    })
  })

  describe('detecting lonely if with block statement', () => {
    test('should report else block containing only an if statement in a block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('else if')
    })

    test('should report when else block has curly braces with single if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        2,
        8,
      )
      const elseBlock = createBlockStatement([innerIf], 2, 4)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report nested lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf2 = createIfStatement(createIdentifier('z'), createBlockStatement([]), null)
      const elseBlock2 = createBlockStatement([innerIf2])
      const innerIf1 = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([]),
        elseBlock2,
      )
      const elseBlock1 = createBlockStatement([innerIf1])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock1)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('else if')
    })
  })

  describe('detecting lonely if without block statement', () => {
    test('should report else block with if statement directly (no braces)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('else if')
    })

    test('should report lonely if without braces on else', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        2,
        8,
      )
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('negative tests - should not report', () => {
    test('should not report when else block has multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const stmt1 = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const stmt2 = { type: 'ExpressionStatement', expression: createIdentifier('b') }
      const elseBlock = createBlockStatement([stmt1, stmt2])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has if and another statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const otherStmt = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const elseBlock = createBlockStatement([innerIf, otherStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when there is no else block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), null)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const elseBlock = createBlockStatement([])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has single non-if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const stmt = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const elseBlock = createBlockStatement([stmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block contains nested if with other statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('z'), createBlockStatement([]), null)
      const otherStmt = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const elseBlock = createBlockStatement([innerIf, otherStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else is a block with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const returnStmt = { type: 'ReturnStatement', argument: createIdentifier('value') }
      const elseBlock = createBlockStatement([returnStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has only a variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const varDecl = { type: 'VariableDeclaration', declarations: [] }
      const elseBlock = createBlockStatement([varDecl])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const whileStmt = {
        type: 'WhileStatement',
        test: createIdentifier('x'),
        body: createBlockStatement([]),
      }
      const elseBlock = createBlockStatement([whileStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const forStmt = { type: 'ForStatement', body: createBlockStatement([]) }
      const elseBlock = createBlockStatement([forStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a switch statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const switchStmt = { type: 'SwitchStatement', discriminant: createIdentifier('x'), cases: [] }
      const elseBlock = createBlockStatement([switchStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a try-catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const tryStmt = { type: 'TryStatement', block: createBlockStatement([]), handler: null }
      const elseBlock = createBlockStatement([tryStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: innerIf,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location for lonely if in block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        10,
        8,
      )
      const elseBlock = createBlockStatement([innerIf], 10, 4)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct location for lonely if without block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        10,
        8,
      )
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

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
        getSource: () => 'if (x) {} else if (y) {}',
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

      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: innerIf,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 10 },
        },
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: innerIf,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 10 },
        },
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: innerIf,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: innerIf,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {},
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: innerIf,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention else if in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports[0].message.toLowerCase()).toContain('else if')
    })

    test('should mention else block in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports[0].message.toLowerCase()).toContain('else')
      expect(reports[0].message.toLowerCase()).toContain('block')
    })
  })
})
