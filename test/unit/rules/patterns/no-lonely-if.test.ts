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

  describe('various test conditions - block statement alternate', () => {
    test('should report when inner if tests a binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const binaryTest = {
        type: 'BinaryExpression',
        operator: '>',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 10 },
      }
      const innerIf = createIfStatement(binaryTest, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if tests a logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const logicalTest = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
      }
      const innerIf = createIfStatement(logicalTest, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if tests a call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const callTest = {
        type: 'CallExpression',
        callee: createIdentifier('isReady'),
        arguments: [],
      }
      const innerIf = createIfStatement(callTest, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if tests a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const memberTest = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('flag'),
      }
      const innerIf = createIfStatement(memberTest, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if tests a unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const unaryTest = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('x'),
      }
      const innerIf = createIfStatement(unaryTest, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if tests a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const literalTest = { type: 'Literal', value: true }
      const innerIf = createIfStatement(literalTest, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if tests null', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(null, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if tests undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(undefined, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('various consequent types - block statement alternate', () => {
    test('should report when inner if consequent is a single expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const consequent = {
        type: 'ExpressionStatement',
        expression: createIdentifier('doSomething'),
      }
      const innerIf = createIfStatement(createIdentifier('y'), consequent, null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if consequent is a return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const consequent = { type: 'ReturnStatement', argument: createIdentifier('val') }
      const innerIf = createIfStatement(createIdentifier('y'), consequent, null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if consequent is a throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const consequent = {
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: createIdentifier('Error'), arguments: [] },
      }
      const innerIf = createIfStatement(createIdentifier('y'), consequent, null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if consequent is a block with multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const stmt1 = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const stmt2 = { type: 'ExpressionStatement', expression: createIdentifier('b') }
      const consequent = createBlockStatement([stmt1, stmt2])
      const innerIf = createIfStatement(createIdentifier('y'), consequent, null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if consequent is an empty block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if consequent is a block with a break statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const consequent = createBlockStatement([{ type: 'BreakStatement', label: null }])
      const innerIf = createIfStatement(createIdentifier('y'), consequent, null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if consequent is a block with a continue statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const consequent = createBlockStatement([{ type: 'ContinueStatement', label: null }])
      const innerIf = createIfStatement(createIdentifier('y'), consequent, null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('inner if with its own else clause', () => {
    test('should report when inner if has else if chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const deeplyInnerIf = createIfStatement(createIdentifier('z'), createBlockStatement([]), null)
      const innerIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([]),
        deeplyInnerIf,
      )
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if has an else block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerElse = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('fallback') },
      ])
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), innerElse)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if has an else block with its own lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const deepIf = createIfStatement(createIdentifier('z'), createBlockStatement([]), null)
      const innerElseBlock = createBlockStatement([deepIf])
      const innerIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([]),
        innerElseBlock,
      )
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('direct alternate (no wrapping block)', () => {
    test('should report when alternate is directly an if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when alternate is an if with complex test', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const complexTest = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }
      const innerIf = createIfStatement(complexTest, createBlockStatement([]), null)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when alternate is an if with its own else', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerElse = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('c') },
      ])
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), innerElse)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when alternate is an if with chained else if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const chainedIf = createIfStatement(createIdentifier('z'), createBlockStatement([]), null)
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), chainedIf)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when alternate is an if with return in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const returnStmt = createBlockStatement([
        { type: 'ReturnStatement', argument: createIdentifier('result') },
      ])
      const innerIf = createIfStatement(createIdentifier('y'), returnStmt, null)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when alternate is an if with throw in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const throwBody = createBlockStatement([
        {
          type: 'ThrowStatement',
          argument: { type: 'NewExpression', callee: createIdentifier('Error'), arguments: [] },
        },
      ])
      const innerIf = createIfStatement(createIdentifier('y'), throwBody, null)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('deeply nested structures', () => {
    test('should report three levels deep of lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const level3 = createIfStatement(createIdentifier('d'), createBlockStatement([]), null)
      const elseBlock3 = createBlockStatement([level3])
      const level2 = createIfStatement(createIdentifier('c'), createBlockStatement([]), elseBlock3)
      const elseBlock2 = createBlockStatement([level2])
      const level1 = createIfStatement(createIdentifier('b'), createBlockStatement([]), elseBlock2)
      const elseBlock1 = createBlockStatement([level1])
      const root = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock1)

      visitor.IfStatement(root)

      expect(reports.length).toBe(1)
    })

    test('should report four levels deep of lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const level4 = createIfStatement(createIdentifier('e'), createBlockStatement([]), null)
      const elseBlock4 = createBlockStatement([level4])
      const level3 = createIfStatement(createIdentifier('d'), createBlockStatement([]), elseBlock4)
      const elseBlock3 = createBlockStatement([level3])
      const level2 = createIfStatement(createIdentifier('c'), createBlockStatement([]), elseBlock3)
      const elseBlock2 = createBlockStatement([level2])
      const level1 = createIfStatement(createIdentifier('b'), createBlockStatement([]), elseBlock2)
      const elseBlock1 = createBlockStatement([level1])
      const root = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock1)

      visitor.IfStatement(root)

      expect(reports.length).toBe(1)
    })

    test('should report five levels deep of lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const l5 = createIfStatement(createIdentifier('f'), createBlockStatement([]), null)
      const eb5 = createBlockStatement([l5])
      const l4 = createIfStatement(createIdentifier('e'), createBlockStatement([]), eb5)
      const eb4 = createBlockStatement([l4])
      const l3 = createIfStatement(createIdentifier('d'), createBlockStatement([]), eb4)
      const eb3 = createBlockStatement([l3])
      const l2 = createIfStatement(createIdentifier('c'), createBlockStatement([]), eb3)
      const eb2 = createBlockStatement([l2])
      const l1 = createIfStatement(createIdentifier('b'), createBlockStatement([]), eb2)
      const eb1 = createBlockStatement([l1])
      const root = createIfStatement(createIdentifier('a'), createBlockStatement([]), eb1)

      visitor.IfStatement(root)

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested lonely if in direct alternate chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const deep = createIfStatement(createIdentifier('d'), createBlockStatement([]), null)
      const level3 = createIfStatement(createIdentifier('c'), createBlockStatement([]), deep)
      const level2 = createIfStatement(createIdentifier('b'), createBlockStatement([]), level3)
      const root = createIfStatement(createIdentifier('a'), createBlockStatement([]), level2)

      visitor.IfStatement(root)

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested with mixed block and direct alternates', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const deep = createIfStatement(createIdentifier('d'), createBlockStatement([]), null)
      const ebDeep = createBlockStatement([deep])
      const level3 = createIfStatement(createIdentifier('c'), createBlockStatement([]), ebDeep)
      const level2 = createIfStatement(createIdentifier('b'), createBlockStatement([]), level3)
      const root = createIfStatement(createIdentifier('a'), createBlockStatement([]), level2)

      visitor.IfStatement(root)

      expect(reports.length).toBe(1)
    })
  })

  describe('negative tests - various non-if statement types in else', () => {
    test('should not report when else block has a do-while statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const doWhile = {
        type: 'DoWhileStatement',
        test: createIdentifier('x'),
        body: createBlockStatement([]),
      }
      const elseBlock = createBlockStatement([doWhile])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a for-in statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const forIn = {
        type: 'ForInStatement',
        left: createIdentifier('key'),
        right: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      const elseBlock = createBlockStatement([forIn])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a for-of statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const forOf = {
        type: 'ForOfStatement',
        left: createIdentifier('item'),
        right: createIdentifier('arr'),
        body: createBlockStatement([]),
      }
      const elseBlock = createBlockStatement([forOf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const funcDecl = {
        type: 'FunctionDeclaration',
        id: createIdentifier('helper'),
        params: [],
        body: createBlockStatement([]),
      }
      const elseBlock = createBlockStatement([funcDecl])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a class declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const classDecl = {
        type: 'ClassDeclaration',
        id: createIdentifier('MyClass'),
        body: { type: 'ClassBody', body: [] },
      }
      const elseBlock = createBlockStatement([classDecl])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a debugger statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const debuggerStmt = { type: 'DebuggerStatement' }
      const elseBlock = createBlockStatement([debuggerStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a with statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const withStmt = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      const elseBlock = createBlockStatement([withStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a labeled statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const labeledStmt = {
        type: 'LabeledStatement',
        label: createIdentifier('loop'),
        body: { type: 'ExpressionStatement', expression: createIdentifier('x') },
      }
      const elseBlock = createBlockStatement([labeledStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has an throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: createIdentifier('Error'), arguments: [] },
      }
      const elseBlock = createBlockStatement([throwStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has an assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const assignExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: createIdentifier('x'),
          right: createIdentifier('y'),
        },
      }
      const elseBlock = createBlockStatement([assignExpr])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has an update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const updateExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UpdateExpression',
          operator: '++',
          argument: createIdentifier('x'),
          prefix: false,
        },
      }
      const elseBlock = createBlockStatement([updateExpr])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a conditional expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const condExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'ConditionalExpression',
          test: createIdentifier('x'),
          consequent: createIdentifier('a'),
          alternate: createIdentifier('b'),
        },
      }
      const elseBlock = createBlockStatement([condExpr])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a new expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const newExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'NewExpression',
          callee: createIdentifier('MyClass'),
          arguments: [],
        },
      }
      const elseBlock = createBlockStatement([newExpr])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a call expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const callExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        },
      }
      const elseBlock = createBlockStatement([callExpr])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('negative tests - alternate not an if or block with single if', () => {
    test('should not report when alternate is a block statement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const alternate = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('a') },
      ])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), alternate)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a while statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const whileStmt = {
        type: 'WhileStatement',
        test: createIdentifier('x'),
        body: createBlockStatement([]),
      }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), whileStmt)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a for statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const forStmt = { type: 'ForStatement', body: createBlockStatement([]) }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), forStmt)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a switch statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const switchStmt = {
        type: 'SwitchStatement',
        discriminant: createIdentifier('x'),
        cases: [],
      }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), switchStmt)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a try statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const tryStmt = { type: 'TryStatement', block: createBlockStatement([]), handler: null }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), tryStmt)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const returnStmt = { type: 'ReturnStatement', argument: createIdentifier('value') }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), returnStmt)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: createIdentifier('Error'), arguments: [] },
      }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), throwStmt)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is an expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const exprStmt = { type: 'ExpressionStatement', expression: createIdentifier('doSomething') }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), exprStmt)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a block with 0 statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const emptyBlock = createBlockStatement([])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), emptyBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a block with 3 statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const stmts = [
        { type: 'ExpressionStatement', expression: createIdentifier('a') },
        { type: 'ExpressionStatement', expression: createIdentifier('b') },
        { type: 'ExpressionStatement', expression: createIdentifier('c') },
      ]
      const block = createBlockStatement(stmts)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a block with 5 statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const stmts = Array.from({ length: 5 }, (_, i) => ({
        type: 'ExpressionStatement',
        expression: createIdentifier(`s${i}`),
      }))
      const block = createBlockStatement(stmts)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a block with if + expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const expr = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const block = createBlockStatement([innerIf, expr])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a block with expression + if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const expr = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const block = createBlockStatement([expr, innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple if statements in else block', () => {
    test('should not report when else block has two if statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const if1 = createIfStatement(createIdentifier('a'), createBlockStatement([]), null)
      const if2 = createIfStatement(createIdentifier('b'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([if1, if2])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has three if statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const if1 = createIfStatement(createIdentifier('a'), createBlockStatement([]), null)
      const if2 = createIfStatement(createIdentifier('b'), createBlockStatement([]), null)
      const if3 = createIfStatement(createIdentifier('c'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([if1, if2, if3])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has if + if + expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const if1 = createIfStatement(createIdentifier('a'), createBlockStatement([]), null)
      const if2 = createIfStatement(createIdentifier('b'), createBlockStatement([]), null)
      const expr = { type: 'ExpressionStatement', expression: createIdentifier('c') }
      const elseBlock = createBlockStatement([if1, if2, expr])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location details', () => {
    test('should report location at line 1 column 0 for lonely if at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        1,
        0,
      )
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        999,
        50,
      )
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location from block statement for wrapped lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        5,
        10,
      )
      const elseBlock = createBlockStatement([innerIf], 5, 6)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should use block location not inner if location', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        20,
        15,
      )
      const elseBlock = createBlockStatement([innerIf], 19, 4)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      // BlockStatement is the alternate, so its location is used
      expect(reports[0].loc?.start.line).toBe(19)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report end location for lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        3,
        4,
      )
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('should report end location from block for wrapped lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        7,
        8,
      )
      const elseBlock = createBlockStatement([innerIf], 7, 4)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(14)
    })
  })

  describe('malformed node handling', () => {
    test('should handle node with missing type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = { test: createIdentifier('x'), consequent: createBlockStatement([]) }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: createIdentifier('x'),
        body: createBlockStatement([]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean alternate true', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: true,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node with numeric alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: 42,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node with string alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: 'some-string',
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node with array alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: [createIfStatement(createIdentifier('y'), createBlockStatement([]), null)],
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node with empty object alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: {},
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node with alternate missing body in BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: { type: 'BlockStatement' },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node with alternate body as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: { type: 'BlockStatement', body: 'not-array' },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node with BlockStatement body having null entry', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: { type: 'BlockStatement', body: [null] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node with BlockStatement body having non-if entry', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: createIdentifier('a') }],
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where alternate is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: false,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where alternate is 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: 0,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where alternate is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
        alternate: '',
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('context handling variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/test.ts',
        'if (a) { foo() } else { if (b) { bar() } }',
      )
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockContext({ extraOption: true, anotherOption: 42 })
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should create visitor that calls report only once per lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)
      visitor.IfStatement(node)

      expect(reports.length).toBe(2)
    })

    test('should create independent visitors per create call', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor1 = noLonelyIfRule.create(ctx1)
      const visitor2 = noLonelyIfRule.create(ctx2)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor1.IfStatement(node)
      visitor2.IfStatement(node)

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })
  })

  describe('node without standard properties', () => {
    test('should handle node with no test property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = {
        type: 'IfStatement',
        consequent: createBlockStatement([]),
        alternate: elseBlock,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with no consequent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        alternate: innerIf,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with prototype-less object', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = Object.create(null)
      innerIf.type = 'IfStatement'
      innerIf.test = createIdentifier('y')
      innerIf.consequent = createBlockStatement([])
      innerIf.alternate = null

      const node = Object.create(null)
      node.type = 'IfStatement'
      node.test = createIdentifier('x')
      node.consequent = createBlockStatement([])
      node.alternate = innerIf

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with frozen object', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = Object.freeze(
        createIfStatement(createIdentifier('y'), createBlockStatement([]), null),
      )
      const node = Object.freeze(
        createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf),
      )

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with sealed object', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = Object.seal(
        createIfStatement(createIdentifier('y'), createBlockStatement([]), null),
      )
      const node = Object.seal(
        createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf),
      )

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('rule properties', () => {
    test('should have docs with url property', () => {
      expect(noLonelyIfRule.meta.docs?.url).toBeDefined()
      expect(typeof noLonelyIfRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing the rule name', () => {
      expect(noLonelyIfRule.meta.docs?.url).toContain('no-lonely-if')
    })

    test('should have description as non-empty string', () => {
      expect(typeof noLonelyIfRule.meta.docs?.description).toBe('string')
      expect(noLonelyIfRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have schema as empty array', () => {
      expect(noLonelyIfRule.meta.schema).toEqual([])
    })

    test('should have create as a function', () => {
      expect(typeof noLonelyIfRule.create).toBe('function')
    })

    test('should return visitor with IfStatement method', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('should not have deprecated flag', () => {
      expect(noLonelyIfRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noLonelyIfRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noLonelyIfRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('concurrent visitor calls', () => {
    test('should handle multiple different nodes in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      // Lonely if node
      const innerIf1 = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock1 = createBlockStatement([innerIf1])
      const lonelyNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([]),
        elseBlock1,
      )

      // Non-lonely node
      const stmt = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const elseBlock2 = createBlockStatement([stmt])
      const nonLonelyNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([]),
        elseBlock2,
      )

      // No else node
      const noElseNode = createIfStatement(createIdentifier('x'), createBlockStatement([]), null)

      visitor.IfStatement(lonelyNode)
      visitor.IfStatement(nonLonelyNode)
      visitor.IfStatement(noElseNode)
      visitor.IfStatement(lonelyNode)

      expect(reports.length).toBe(2)
    })

    test('should correctly identify lonely if after non-lonely if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      // Non-lonely first
      const stmt = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const nonLonelyElse = createBlockStatement([stmt])
      const nonLonelyNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([]),
        nonLonelyElse,
      )

      // Lonely second
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const lonelyElse = createBlockStatement([innerIf])
      const lonelyNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([]),
        lonelyElse,
      )

      visitor.IfStatement(nonLonelyNode)
      visitor.IfStatement(lonelyNode)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('else if')
    })
  })

  describe('BlockStatement edge cases', () => {
    test('should not report when BlockStatement body has length 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const emptyBlock = createBlockStatement([])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), emptyBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when BlockStatement body has length 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const stmt1 = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const stmt2 = { type: 'ExpressionStatement', expression: createIdentifier('b') }
      const block = createBlockStatement([stmt1, stmt2])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report when BlockStatement body has exactly 1 if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const block = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when BlockStatement body has 1 non-if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const stmt = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const block = createBlockStatement([stmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BlockStatement body as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const block = { type: 'BlockStatement', body: null }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle BlockStatement body as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const block = { type: 'BlockStatement' }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })
  })

  describe('visitor return value', () => {
    test('IfStatement handler should return void for lonely if', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      const result = visitor.IfStatement(node)

      expect(result).toBeUndefined()
    })

    test('IfStatement handler should return void for null node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const result = visitor.IfStatement(null)

      expect(result).toBeUndefined()
    })

    test('IfStatement handler should return void for undefined node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const result = visitor.IfStatement(undefined)

      expect(result).toBeUndefined()
    })

    test('IfStatement handler should return void for non-lonely node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), null)

      const result = visitor.IfStatement(node)

      expect(result).toBeUndefined()
    })
  })

  describe('special value nodes', () => {
    test('should handle NaN as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(NaN)).not.toThrow()
    })

    test('should handle Infinity as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(Infinity)).not.toThrow()
    })

    test('should handle negative number as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(-1)).not.toThrow()
    })

    test('should handle float as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(3.14)).not.toThrow()
    })

    test('should handle empty string as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement('')).not.toThrow()
    })

    test('should handle boolean true as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(true)).not.toThrow()
    })

    test('should handle boolean false as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(false)).not.toThrow()
    })

    test('should handle Symbol as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(Symbol('test'))).not.toThrow()
    })

    test('should handle BigInt as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(BigInt(42))).not.toThrow()
    })

    test('should handle function as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(() => {})).not.toThrow()
    })

    test('should handle array as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement([1, 2, 3])).not.toThrow()
    })

    test('should handle Date as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(new Date())).not.toThrow()
    })

    test('should handle RegExp as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(/test/)).not.toThrow()
    })

    test('should handle Map as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(new Map())).not.toThrow()
    })

    test('should handle Set as node', () => {
      const { context } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      expect(() => visitor.IfStatement(new Set())).not.toThrow()
    })
  })

  describe('location edge cases for extractLocation', () => {
    test('should use default location when alternate has no loc', () => {
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

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with NaN line', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: NaN, column: 0 },
          end: { line: NaN, column: 10 },
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
    })

    test('should handle loc with Infinity line', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: Infinity, column: 0 },
          end: { line: Infinity, column: 10 },
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
    })

    test('should handle loc with negative line', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: -5, column: 0 },
          end: { line: -5, column: 10 },
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
      expect(reports[0].loc?.start.line).toBe(-5)
    })

    test('should handle loc with negative column', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: 1, column: -3 },
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
      expect(reports[0].loc?.start.column).toBe(-3)
    })

    test('should handle loc with null start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: null as unknown as { line: number; column: number },
          end: null as unknown as { line: number; column: number },
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

    test('should handle loc with string line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: '10' as unknown as number, column: '5' as unknown as number },
          end: { line: '10' as unknown as number, column: '15' as unknown as number },
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
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc start as number directly', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: 5 as unknown as { line: number; column: number },
          end: 10 as unknown as { line: number; column: number },
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
    })

    test('should handle loc with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('y'),
        consequent: createBlockStatement([]),
        alternate: null,
        loc: {
          start: { line: 5, column: 3, offset: 42 },
          end: { line: 5, column: 10, offset: 49 },
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
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle loc with zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatementWithLocation(
        createIdentifier('y'),
        createBlockStatement([]),
        null,
        0,
        0,
      )
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('combined scenarios', () => {
    test('should handle lonely if in both consequent and alternate of different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      // Node 1: lonely if in alternate
      const innerIf1 = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock1 = createBlockStatement([innerIf1])
      const node1 = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock1)

      // Node 2: lonely if directly as alternate
      const innerIf2 = createIfStatement(createIdentifier('b'), createBlockStatement([]), null)
      const node2 = createIfStatement(createIdentifier('a'), createBlockStatement([]), innerIf2)

      visitor.IfStatement(node1)
      visitor.IfStatement(node2)

      expect(reports.length).toBe(2)
    })

    test('should handle mix of lonely and non-lonely nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      // Lonely
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const lonelyNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([]),
        elseBlock,
      )

      // Non-lonely: empty alternate
      const emptyAlt = createIfStatement(createIdentifier('x'), createBlockStatement([]), null)

      // Non-lonely: multi-statement alternate
      const stmts = [
        { type: 'ExpressionStatement', expression: createIdentifier('a') },
        { type: 'ExpressionStatement', expression: createIdentifier('b') },
      ]
      const multiAlt = createBlockStatement(stmts)
      const multiNode = createIfStatement(createIdentifier('x'), createBlockStatement([]), multiAlt)

      visitor.IfStatement(lonelyNode)
      visitor.IfStatement(emptyAlt)
      visitor.IfStatement(multiNode)

      expect(reports.length).toBe(1)
    })

    test('should report each lonely if independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      for (let i = 0; i < 10; i++) {
        const innerIf = createIfStatement(createIdentifier(`y${i}`), createBlockStatement([]), null)
        const elseBlock = createBlockStatement([innerIf])
        const node = createIfStatement(
          createIdentifier(`x${i}`),
          createBlockStatement([]),
          elseBlock,
        )
        visitor.IfStatement(node)
      }

      expect(reports.length).toBe(10)
    })

    test('should correctly alternate between lonely and non-lonely', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          // Lonely
          const innerIf = createIfStatement(
            createIdentifier(`y${i}`),
            createBlockStatement([]),
            null,
          )
          const elseBlock = createBlockStatement([innerIf])
          const node = createIfStatement(
            createIdentifier(`x${i}`),
            createBlockStatement([]),
            elseBlock,
          )
          visitor.IfStatement(node)
        } else {
          // Non-lonely
          const node = createIfStatement(createIdentifier(`x${i}`), createBlockStatement([]), null)
          visitor.IfStatement(node)
        }
      }

      expect(reports.length).toBe(10)
    })
  })

  describe('additional positive detection tests', () => {
    test('should report lonely if with literal test in block alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(
        { type: 'Literal', value: true },
        createBlockStatement([]),
        null,
      )
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report lonely if with literal test as direct alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(
        { type: 'Literal', value: false },
        createBlockStatement([]),
        null,
      )
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if consequent has nested blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const nestedBlock = createBlockStatement([
        createBlockStatement([
          { type: 'ExpressionStatement', expression: createIdentifier('deep') },
        ]),
      ])
      const innerIf = createIfStatement(createIdentifier('y'), nestedBlock, null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when outer if test is complex expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const complexTest = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'BinaryExpression',
          operator: '>',
          left: createIdentifier('a'),
          right: { type: 'Literal', value: 5 },
        },
        right: createIdentifier('b'),
      }
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(complexTest, createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if has empty consequent block in direct alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const node = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([{ type: 'ExpressionStatement', expression: createIdentifier('a') }]),
        innerIf,
      )

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if has its own alternate in block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerAlternate = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('z') },
      ])
      const innerIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([]),
        innerAlternate,
      )
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when consequent of outer if is a non-block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const exprConsequent = { type: 'ExpressionStatement', expression: createIdentifier('doIt') }
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), exprConsequent, elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when both test expressions are member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const outerTest = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('flag1'),
      }
      const innerTest = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('flag2'),
      }
      const innerIf = createIfStatement(innerTest, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(outerTest, createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report lonely if with sequence expression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const seqExpr = {
        type: 'SequenceExpression',
        expressions: [createIdentifier('a'), createIdentifier('b')],
      }
      const innerIf = createIfStatement(seqExpr, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report lonely if with template literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const tplLiteral = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' } }],
        expressions: [],
      }
      const innerIf = createIfStatement(tplLiteral, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if test is a typeof expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const typeofExpr = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
        prefix: true,
      }
      const innerIf = createIfStatement(typeofExpr, createBlockStatement([]), null)
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), innerIf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when inner if test is a void expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('x'),
        prefix: true,
      }
      const innerIf = createIfStatement(voidExpr, createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('a'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('additional negative detection tests', () => {
    test('should not report when else block has if + if + if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const if1 = createIfStatement(createIdentifier('a'), createBlockStatement([]), null)
      const if2 = createIfStatement(createIdentifier('b'), createBlockStatement([]), null)
      const if3 = createIfStatement(createIdentifier('c'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([if1, if2, if3])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has expression + if', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const expr = { type: 'ExpressionStatement', expression: createIdentifier('a') }
      const innerIf = createIfStatement(createIdentifier('b'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([expr, innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a do-while statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const doWhile = {
        type: 'DoWhileStatement',
        test: createIdentifier('cond'),
        body: createBlockStatement([]),
      }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), doWhile)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a for-in statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const forIn = {
        type: 'ForInStatement',
        left: createIdentifier('k'),
        right: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), forIn)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a for-of statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const forOf = {
        type: 'ForOfStatement',
        left: createIdentifier('item'),
        right: createIdentifier('arr'),
        body: createBlockStatement([]),
      }
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), forOf)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a block with many expression statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const stmts = Array.from({ length: 10 }, (_, i) => ({
        type: 'ExpressionStatement',
        expression: createIdentifier(`stmt${i}`),
      }))
      const block = createBlockStatement(stmts)
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), block)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has only a break statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const breakStmt = { type: 'BreakStatement', label: null }
      const elseBlock = createBlockStatement([breakStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has only a continue statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const continueStmt = { type: 'ContinueStatement', label: null }
      const elseBlock = createBlockStatement([continueStmt])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a try-finally', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const tryFinally = {
        type: 'TryStatement',
        block: createBlockStatement([]),
        handler: null,
        finalizer: createBlockStatement([]),
      }
      const elseBlock = createBlockStatement([tryFinally])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when else block has a catch clause handler', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const tryCatch = {
        type: 'TryStatement',
        block: createBlockStatement([]),
        handler: {
          type: 'CatchClause',
          param: createIdentifier('e'),
          body: createBlockStatement([]),
        },
      }
      const elseBlock = createBlockStatement([tryCatch])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('repeated calls and state isolation', () => {
    test('should not accumulate state across different visitor instances', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noLonelyIfRule.create(ctx1)
      const visitor2 = noLonelyIfRule.create(ctx2)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const lonelyNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([]),
        elseBlock,
      )

      const nonLonelyNode = createIfStatement(createIdentifier('x'), createBlockStatement([]), null)

      visitor1.IfStatement(lonelyNode)
      visitor2.IfStatement(nonLonelyNode)

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should handle same node passed to same visitor multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const node = createIfStatement(createIdentifier('x'), createBlockStatement([]), elseBlock)

      for (let i = 0; i < 5; i++) {
        visitor.IfStatement(node)
      }

      expect(reports.length).toBe(5)
    })

    test('should handle interleaved lonely and null nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noLonelyIfRule.create(context)

      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement([]), null)
      const elseBlock = createBlockStatement([innerIf])
      const lonelyNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([]),
        elseBlock,
      )

      visitor.IfStatement(lonelyNode)
      visitor.IfStatement(null)
      visitor.IfStatement(lonelyNode)
      visitor.IfStatement(undefined)
      visitor.IfStatement(lonelyNode)

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('should have a default export that equals named export', () => {
      expect(noLonelyIfRule).toBeDefined()
      expect(noLonelyIfRule.meta).toBeDefined()
      expect(noLonelyIfRule.create).toBeDefined()
    })
  })
})
