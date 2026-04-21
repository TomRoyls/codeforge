import { describe, test, expect, vi } from 'vitest'
import { noEmptyRule } from '../../../../src/rules/patterns/no-empty.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

/** Local helper for tests that need custom comments (not supported by shared helper) */
function createMockContextWithComments(
  comments: readonly unknown[],
  source = 'function test() {}',
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
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => (comments ? [...comments] : []) as unknown[],
    config: { options: [{}] },
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

function createBlockStatement(body: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createComment(
  startLine = 1,
  startColumn = 1,
  endLine?: number,
  endColumn?: number,
): unknown {
  return {
    type: 'Block',
    value: 'comment',
    loc: {
      start: { line: startLine, column: startColumn },
      end: { line: endLine ?? startLine, column: endColumn ?? startColumn + 5 },
    },
  }
}

describe('no-empty rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noEmptyRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noEmptyRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noEmptyRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noEmptyRule.meta.fixable).toBe('code')
    })

    test('should mention empty block in description', () => {
      expect(noEmptyRule.meta.docs?.description.toLowerCase()).toContain('empty')
    })

    test('should have meta property', () => {
      expect(noEmptyRule).toHaveProperty('meta')
    })

    test('should have create method', () => {
      expect(noEmptyRule).toHaveProperty('create')
      expect(typeof noEmptyRule.create).toBe('function')
    })

    test('should have docs property in meta', () => {
      expect(noEmptyRule.meta.docs).toBeDefined()
      expect(noEmptyRule.meta.docs).not.toBeNull()
    })

    test('should have description as non-empty string', () => {
      expect(typeof noEmptyRule.meta.docs?.description).toBe('string')
      expect(noEmptyRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have severity as valid value', () => {
      expect(['off', 'warn', 'error']).toContain(noEmptyRule.meta.severity)
    })

    test('should have type as valid value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noEmptyRule.meta.type)
    })

    test('should have fixable as valid value when defined', () => {
      if (noEmptyRule.meta.fixable) {
        expect(['code', 'whitespace']).toContain(noEmptyRule.meta.fixable)
      }
    })

    test('should have docs url', () => {
      expect(noEmptyRule.meta.docs?.url).toBeDefined()
      expect(typeof noEmptyRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noEmptyRule.meta.schema)).toBe(true)
    })

    test('should have recommended as boolean', () => {
      expect(typeof noEmptyRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as string', () => {
      expect(typeof noEmptyRule.meta.docs?.category).toBe('string')
    })

    test('should not be deprecated', () => {
      expect(noEmptyRule.meta.deprecated).toBeFalsy()
    })

    test('should not be replaced by other rules', () => {
      expect(noEmptyRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noEmptyRule.meta.requiresTypeChecking).toBeFalsy()
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(visitor).toHaveProperty('BlockStatement')
    })

    test('should return BlockStatement as a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(typeof visitor.BlockStatement).toBe('function')
    })

    test('should not throw when creating visitor', () => {
      const { context } = createMockRuleContext()

      expect(() => noEmptyRule.create(context)).not.toThrow()
    })

    test('should return independent visitors for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext()
      const { context: ctx2 } = createMockRuleContext()
      const visitor1 = noEmptyRule.create(ctx1)
      const visitor2 = noEmptyRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with only BlockStatement method', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(Object.keys(visitor)).toEqual(['BlockStatement'])
    })

    test('should allow calling BlockStatement multiple times on same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))
      visitor.BlockStatement(createBlockStatement([], 2, 0))
      visitor.BlockStatement(createBlockStatement([], 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should handle context with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/utils.ts' })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should handle context with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/custom/file.ts',
        getAST: () => null,
        getSource: () => '{}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/custom',
      } as unknown as RuleContext

      const visitor = noEmptyRule.create(context)
      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })
  })

  describe('empty block detection', () => {
    test('should report empty block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected empty block.')
    })

    test('should not report block with statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([
        { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'test' } },
      ])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report empty block in if statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 5, 10)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report empty block in try-catch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 10, 20)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block in for loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 15, 5)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block in while loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 20, 15)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block in switch case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 25, 10)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report empty block at large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 9999, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report empty block at large column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 500))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report empty block with zero-length span', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 5, column: 10 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect empty body when body is explicitly empty array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block spanning multiple lines', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 10, column: 1 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('should report empty block within class method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 42, 8))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report empty block within async function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 7, 4))

      expect(reports.length).toBe(1)
    })

    test('should report empty block within generator function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 11, 6))

      expect(reports.length).toBe(1)
    })

    test('should report empty block in do-while loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 30, 2))

      expect(reports.length).toBe(1)
    })

    test('should report empty block in for-in loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 35, 4))

      expect(reports.length).toBe(1)
    })

    test('should report empty block in for-of loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 40, 6))

      expect(reports.length).toBe(1)
    })

    test('should report empty block in else clause', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 14, 2))

      expect(reports.length).toBe(1)
    })

    test('should report empty block in labeled statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 22, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect empty body when body property is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect empty body when body property is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect empty body when body property is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block in static block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 50, 2))

      expect(reports.length).toBe(1)
    })

    test('should report empty block in module-level IIFE', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 15))

      expect(reports.length).toBe(1)
    })

    test('should report empty block at the end of file', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 100, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('NOT reporting non-empty blocks', () => {
    test('should not report block with ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ExpressionStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'VariableDeclaration' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'FunctionDeclaration' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with ReturnStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ReturnStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'IfStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with ForStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ForStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'WhileStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with TryStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'TryStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with SwitchStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'SwitchStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with ThrowStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ThrowStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ClassDeclaration' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with BreakStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'BreakStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with ContinueStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ContinueStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with DebuggerStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'DebuggerStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with DoWhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'DoWhileStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with ForInStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ForInStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with ForOfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ForOfStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with LabeledStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'LabeledStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with WithStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'WithStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with multiple statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([
        { type: 'VariableDeclaration' },
        { type: 'ExpressionStatement' },
        { type: 'ReturnStatement' },
      ])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with null element in body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([null])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with undefined element in body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([undefined])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with empty object in body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{}])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-BlockStatement node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'IfStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Program node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'Program',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ClassBody node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'ClassBody',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report SwitchCase node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'SwitchCase',
        consequent: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report EmptyStatement node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'EmptyStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block containing only a comment', () => {
      const { context, reports } = createMockContextWithComments([createComment(1, 1, 1, 6)])
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report block with a single statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: 'ExpressionStatement' }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('comments in blocks', () => {
    test('should not report block with comments inside', () => {
      // Block at line 1, columns 0-20. Comment at line 1, columns 1-6 (fully contained)
      const { context, reports } = createMockContextWithComments([createComment(1, 1, 1, 6)])
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report empty block without comments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report block with multiple comments', () => {
      // Block at line 1, columns 0-20. Comments at columns 1-6 and 8-13 (both fully contained)
      const { context, reports } = createMockContextWithComments([
        createComment(1, 1, 1, 6),
        createComment(1, 8, 1, 13),
      ])
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function body with comment', () => {
      // Block at line 2, columns 0-20. Comment at columns 1-6 (fully contained)
      const { context, reports } = createMockContextWithComments([createComment(2, 1, 2, 6)])
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 2, column: 0 },
          end: { line: 2, column: 20 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty comments array', () => {
      const { context, reports } = createMockContextWithComments([])
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined comments', () => {
      const { context, reports } = createMockContextWithComments(undefined)
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement('string')).not.toThrow()
      expect(() => visitor.BlockStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with incomplete loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {},
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 10, 5)

      visitor.BlockStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle block without body property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 2 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-BlockStatement node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'IfStatement',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(true)).not.toThrow()
      expect(() => visitor.BlockStatement(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(42)).not.toThrow()
      expect(() => visitor.BlockStatement(0)).not.toThrow()
      expect(() => visitor.BlockStatement(-1)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement('')).not.toThrow()
      expect(() => visitor.BlockStatement('BlockStatement')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report node with body as non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: 'not an array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report node with body as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report node with body as boolean true', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        extra: 'property',
        another: { nested: true },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Symbol.toPrimitive', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should not report node with body as object without length', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: { foo: 'bar' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle large number of comments', () => {
      const comments = Array.from({ length: 100 }, (_, i) => createComment(1, i * 2, 1, i * 2 + 1))
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 200 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report when comment start line matches but end column exceeds block', () => {
      const comments = [
        {
          type: 'Line',
          value: ' comment',
          loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body with undefined entries that still count as non-empty', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([undefined, undefined])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle negative line numbers in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: -1, column: 0 }, end: { line: 1, column: 2 } },
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle negative column numbers in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: -1 }, end: { line: 1, column: 2 } },
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle floating point line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1.5, column: 0 }, end: { line: 2.5, column: 2 } },
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle zero values in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 42, 0))

      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 15))

      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 5, column: 0 }, end: { line: 8, column: 1 } },
      }

      visitor.BlockStatement(node)

      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.BlockStatement(node)

      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should provide location with default when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = { type: 'BlockStatement', body: [] }

      visitor.BlockStatement(node)

      expect(reports[0].loc).toBeUndefined()
    })

    test('should provide location with default when loc has no start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should preserve location for multi-line block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 10, column: 4 }, end: { line: 20, column: 5 } },
      }

      visitor.BlockStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(20)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should handle location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at very large line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 99999, 0))

      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle location at very large column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 99999))

      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle start and end at same position', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 10 } },
      }

      visitor.BlockStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should preserve exact column values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 3, column: 7 }, end: { line: 3, column: 9 } },
      }

      visitor.BlockStatement(node)

      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('should handle location spanning many lines', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 100, column: 1 } },
      }

      visitor.BlockStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(100)
    })

    test('should report location for each independent empty block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 3, 5))
      visitor.BlockStatement(createBlockStatement([], 10, 2))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(10)
    })
  })

  describe('message quality', () => {
    test('should report correct message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message).toBe('Unexpected empty block.')
    })

    test('should mention empty in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should mention block in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message.toLowerCase()).toContain('block')
    })

    test('should start with Unexpected', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message).toMatch(/^Unexpected/)
    })

    test('should end with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have consistent message across multiple reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))
      visitor.BlockStatement(createBlockStatement([], 5, 10))
      visitor.BlockStatement(createBlockStatement([], 10, 20))

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should be a string message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have message shorter than 100 characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message.length).toBeLessThan(100)
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should contain word unexpected', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })
  })

  describe('multiple reports', () => {
    test('should report two empty blocks independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))
      visitor.BlockStatement(createBlockStatement([], 2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report three empty blocks independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))
      visitor.BlockStatement(createBlockStatement([], 2, 0))
      visitor.BlockStatement(createBlockStatement([], 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should not report after non-empty block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([{ type: 'ExpressionStatement' }]))
      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should report empty then not report non-empty then report empty', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))
      visitor.BlockStatement(createBlockStatement([{ type: 'ExpressionStatement' }]))
      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(2)
    })

    test('should track reports in order', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))
      visitor.BlockStatement(createBlockStatement([], 5, 0))
      visitor.BlockStatement(createBlockStatement([], 10, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should handle many sequential empty blocks', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.BlockStatement(createBlockStatement([], i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })

    test('should handle alternating empty and non-empty blocks', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          visitor.BlockStatement(createBlockStatement([]))
        } else {
          visitor.BlockStatement(createBlockStatement([{ type: 'ExpressionStatement' }]))
        }
      }

      expect(reports.length).toBe(5)
    })

    test('should not accumulate reports across visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noEmptyRule.create(ctx1)
      const visitor2 = noEmptyRule.create(ctx2)

      visitor1.BlockStatement(createBlockStatement([]))
      visitor2.BlockStatement(createBlockStatement([]))
      visitor2.BlockStatement(createBlockStatement([]))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(2)
    })

    test('should report only empty blocks mixed with comment-containing blocks', () => {
      const { context, reports } = createMockContextWithComments([createComment(5, 0, 5, 5)])
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
      })
      visitor.BlockStatement(createBlockStatement([], 10, 0))

      expect(reports.length).toBe(2)
    })

    test('should report empty block then handle null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))
      visitor.BlockStatement(null)
      visitor.BlockStatement(createBlockStatement([], 5, 0))

      expect(reports.length).toBe(2)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/index.ts' })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; {}' })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should work with minimal source', () => {
      const { context, reports } = createMockRuleContext({ source: '{}' })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/component.tsx' })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/script.js' })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should work with nested directory path', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/project/src/features/auth/login.ts',
      })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message }),
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => '{}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noEmptyRule.create(context)
      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should work with context that has no tokens', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should not be affected by options in config', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowEmptyCatch: true }] })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })
  })

  describe('comment positioning', () => {
    test('should not report when comment is between start and end lines', () => {
      // Block: lines 1-3, columns 0-20. Comment at line 2, columns 0-10 (fully contained)
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 2, column: 0 },
            end: { line: 2, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 3, column: 20 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report when comment is before start line', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 1, column: 0 },
            end: { line: 1, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 5, column: 1 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when comment is after end line', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 10, column: 0 },
            end: { line: 10, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 5, column: 1 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when comment is on end line before end column', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 5, column: 0 },
            end: { line: 5, column: 5 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 5, column: 10 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report when comment is on end line at end column', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 5, column: 10 },
            end: { line: 5, column: 20 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 5, column: 10 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when comment is on start line at start column', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 3, column: 0 },
            end: { line: 3, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 5, column: 1 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when comment spans from block start to block end', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 1, column: 0 },
            end: { line: 1, column: 20 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report when comment end column exceeds block end column', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 1, column: 0 },
            end: { line: 1, column: 21 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when comment start column is before block start column', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 1, column: 0 },
            end: { line: 1, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 20 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when one of multiple comments is inside block', () => {
      const comments = [
        {
          type: 'Block',
          value: 'outside',
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
        },
        {
          type: 'Block',
          value: 'inside',
          loc: { start: { line: 2, column: 1 }, end: { line: 2, column: 10 } },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 20 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report when all comments are outside block range', () => {
      const comments = [
        {
          type: 'Block',
          value: 'before',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        {
          type: 'Block',
          value: 'after',
          loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 10 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report with line comment fully inside block', () => {
      const comments = [
        {
          type: 'Line',
          value: ' line comment',
          loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 8 } },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 10 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle comment at exact same position as block', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('comment edge cases', () => {
    test('should handle comment with incomplete loc', () => {
      const { context, reports } = createMockContextWithComments([
        { type: 'Block', value: 'comment', loc: {} },
      ])
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle comment with missing start in loc', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            end: { line: 1, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle comment with missing end in loc', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 1, column: 5 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle comment with non-number line', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: '1' as unknown as number, column: 5 },
            end: { line: 1, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle comment with non-number column', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: 1, column: '5' as unknown as number },
            end: { line: 1, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle comment with null loc', () => {
      const comments = [{ type: 'Block', value: 'comment', loc: null }]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle comment without loc property', () => {
      const comments = [{ type: 'Block', value: 'comment' }]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle comment that is a primitive', () => {
      const { context, reports } = createMockContextWithComments(['just a string' as unknown])
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle comment with NaN values', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: NaN, column: NaN },
            end: { line: NaN, column: NaN },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle comment with Infinity values', () => {
      const comments = [
        {
          type: 'Block',
          value: 'comment',
          loc: {
            start: { line: Infinity, column: 0 },
            end: { line: Infinity, column: 10 },
          },
        },
      ]
      const { context, reports } = createMockContextWithComments(comments)
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], 1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('loc edge cases', () => {
    test('should handle node with non-number line in start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: '1' as unknown as number, column: 0 },
          end: { line: 1, column: 2 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with non-number column in end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: '2' as unknown as number },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with missing start in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          end: { line: 1, column: 2 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with missing end in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: null,
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with string loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: 'invalid',
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with NaN line values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: NaN, column: 0 },
          end: { line: NaN, column: 2 },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Infinity column values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 1, column: Infinity },
          end: { line: 1, column: Infinity },
        },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('config handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

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
        getSource: () => 'function test() {}',
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

      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(createBlockStatement([]))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with extra options', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ extraOption: true, anotherOption: 'value' }],
      })
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(1)
    })

    test('should handle null config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '{}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(createBlockStatement([]))).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix when node has range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 2 },
        },
        range: [0, 2] as [number, number],
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([1, 1])
      expect(reports[0].fix?.text).toBe('// empty ')
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix with range offset by 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        range: [10, 12] as [number, number],
      }

      visitor.BlockStatement(node)

      expect(reports[0].fix?.range).toEqual([11, 11])
    })

    test('should provide fix with correct comment text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        range: [5, 7] as [number, number],
      }

      visitor.BlockStatement(node)

      expect(reports[0].fix?.text).toBe('// empty ')
    })

    test('should handle range at position 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        range: [0, 2] as [number, number],
      }

      visitor.BlockStatement(node)

      expect(reports[0].fix?.range).toEqual([1, 1])
    })

    test('should handle range at large position', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        range: [5000, 5002] as [number, number],
      }

      visitor.BlockStatement(node)

      expect(reports[0].fix?.range).toEqual([5001, 5001])
    })

    test('should not provide fix when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        range: [0, 2] as [number, number],
      }

      visitor.BlockStatement(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when node has incomplete loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: {},
        range: [0, 2] as [number, number],
      }

      visitor.BlockStatement(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix for each reported empty block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node1 = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        range: [0, 2] as [number, number],
      }
      const node2 = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 2 } },
        range: [10, 12] as [number, number],
      }

      visitor.BlockStatement(node1)
      visitor.BlockStatement(node2)

      expect(reports[0].fix).toBeDefined()
      expect(reports[1].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([1, 1])
      expect(reports[1].fix?.range).toEqual([11, 11])
    })
  })

  describe('parameterized node type checks', () => {
    test.each([
      ['IfStatement'],
      ['ForStatement'],
      ['WhileStatement'],
      ['DoWhileStatement'],
      ['ForInStatement'],
      ['ForOfStatement'],
      ['SwitchStatement'],
      ['TryStatement'],
      ['WithStatement'],
      ['LabeledStatement'],
      ['Program'],
      ['ClassBody'],
      ['FunctionExpression'],
      ['ArrowFunctionExpression'],
      ['CatchClause'],
    ])('should not report for node type %s', (nodeType) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: nodeType,
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized statement detection', () => {
    test.each([
      ['ExpressionStatement'],
      ['VariableDeclaration'],
      ['FunctionDeclaration'],
      ['ReturnStatement'],
      ['IfStatement'],
      ['ForStatement'],
      ['WhileStatement'],
      ['DoWhileStatement'],
      ['ForInStatement'],
      ['ForOfStatement'],
      ['SwitchStatement'],
      ['TryStatement'],
      ['ThrowStatement'],
      ['ClassDeclaration'],
      ['BreakStatement'],
      ['ContinueStatement'],
      ['DebuggerStatement'],
      ['LabeledStatement'],
      ['WithStatement'],
      ['ImportDeclaration'],
      ['ExportNamedDeclaration'],
      ['ExportDefaultDeclaration'],
      ['ExportAllDeclaration'],
      ['EmptyStatement'],
    ])('should not report block containing %s', (statementType) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([{ type: statementType }])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized location values', () => {
    test.each([
      [1, 0],
      [1, 10],
      [5, 0],
      [5, 20],
      [100, 0],
      [100, 50],
      [1, 999],
      [999, 1],
      [50, 50],
      [0, 0],
    ] as [number, number][])('should report empty block at line %i column %i', (line, column) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([], line, column))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })

  describe('parameterized comment detection', () => {
    test.each([
      [1, 0, 1, 10],
      [1, 5, 1, 15],
      [2, 0, 2, 10],
      [3, 0, 3, 5],
      [1, 0, 1, 2],
    ] as [number, number, number, number][])(
      'should not report when comment at line %i col %i to line %i col %i is inside block (1,0)-(3,20)',
      (startLine, startCol, endLine, endCol) => {
        const comments = [
          {
            type: 'Block',
            value: 'comment',
            loc: {
              start: { line: startLine, column: startCol },
              end: { line: endLine, column: endCol },
            },
          },
        ]
        const { context, reports } = createMockContextWithComments(comments)
        const visitor = noEmptyRule.create(context)

        const node = {
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 20 } },
        }

        visitor.BlockStatement(node)

        expect(reports.length).toBe(0)
      },
    )

    test.each([
      [0, 0, 0, 10],
      [4, 0, 4, 10],
      [1, 0, 4, 10],
      [0, 0, 1, 10],
    ] as [number, number, number, number][])(
      'should report when comment at line %i col %i to line %i col %i is outside block (1,0)-(3,20)',
      (startLine, startCol, endLine, endCol) => {
        const comments = [
          {
            type: 'Block',
            value: 'comment',
            loc: {
              start: { line: startLine, column: startCol },
              end: { line: endLine, column: endCol },
            },
          },
        ]
        const { context, reports } = createMockContextWithComments(comments)
        const visitor = noEmptyRule.create(context)

        const node = {
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 20 } },
        }

        visitor.BlockStatement(node)

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('parameterized invalid node inputs', () => {
    test.each([
      [null, 'null'],
      [undefined, 'undefined'],
      ['', 'empty string'],
      ['BlockStatement', 'type string'],
      [0, 'zero'],
      [42, 'number'],
      [true, 'boolean true'],
      [false, 'boolean false'],
      [[], 'empty array'],
      [[1, 2, 3], 'array with elements'],
    ])('should not report for input: %s', (input, _description) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(input)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized body types', () => {
    test.each([
      [null, 'null body'],
      [undefined, 'undefined body'],
      [false, 'boolean body false'],
    ])('should report for BlockStatement with %s', (body, _description) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test.each([
      [true, 'boolean body true'],
      [42, 'number body'],
      ['statements', 'string body'],
      [{ key: 'value' }, 'object body without length'],
    ])('should not report for BlockStatement with %s', (body, _description) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized multi-report scenarios', () => {
    test.each([
      [1, 1],
      [2, 2],
      [3, 3],
      [5, 5],
      [10, 10],
    ])('should report exactly %i empty blocks when visiting %i empty nodes', (count, expected) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      for (let i = 0; i < count; i++) {
        visitor.BlockStatement(createBlockStatement([], i + 1, 0))
      }

      expect(reports.length).toBe(expected)
    })
  })

  describe('rule interface compliance', () => {
    test('should be a valid RuleDefinition', () => {
      expect(noEmptyRule).toHaveProperty('meta')
      expect(noEmptyRule).toHaveProperty('create')
    })

    test('should have create that returns RuleVisitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should have create that accepts RuleContext', () => {
      const { context } = createMockRuleContext()

      expect(() => noEmptyRule.create(context)).not.toThrow()
    })

    test('should have meta with required fields', () => {
      expect(noEmptyRule.meta).toHaveProperty('type')
      expect(noEmptyRule.meta).toHaveProperty('severity')
    })
  })
})
