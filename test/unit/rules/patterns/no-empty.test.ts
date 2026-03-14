import { describe, test, expect, vi } from 'vitest'
import { noEmptyRule } from '../../../../src/rules/patterns/no-empty.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function test() {}',
  comments: readonly unknown[] = [],
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
    getComments: () => comments as unknown[],
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
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noEmptyRule.create(context)

      expect(visitor).toHaveProperty('BlockStatement')
    })
  })

  describe('empty block detection', () => {
    test('should report empty block', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected empty block.')
    })

    test('should not report block with statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([
        { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'test' } },
      ])

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report empty block in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 5, 10)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report empty block in try-catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 10, 20)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block in for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 15, 5)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block in while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 20, 15)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty block in switch case', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 25, 10)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('comments in blocks', () => {
    test('should not report block with comments inside', () => {
      // Block at line 1, columns 0-20. Comment at line 1, columns 1-6 (fully contained)
      const { context, reports } = createMockContext({}, '/src/file.ts', 'function test() {}', [
        createComment(1, 1, 1, 6),
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

    test('should report empty block without comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report block with multiple comments', () => {
      // Block at line 1, columns 0-20. Comments at columns 1-6 and 8-13 (both fully contained)
      const { context, reports } = createMockContext({}, '/src/file.ts', 'function test() {}', [
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
      const { context, reports } = createMockContext({}, '/src/file.ts', 'function test() {}', [
        createComment(2, 1, 2, 6),
      ])
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
      const { context, reports } = createMockContext({}, '/src/file.ts', 'function test() {}', [])
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined comments', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        undefined,
      )
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyRule.create(context)

      expect(() => visitor.BlockStatement('string')).not.toThrow()
      expect(() => visitor.BlockStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with incomplete loc', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 10, 5)

      visitor.BlockStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle block without body property', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
  })

  describe('message quality', () => {
    test('should report correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message).toBe('Unexpected empty block.')
    })

    test('should mention empty in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should mention block in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports[0].message.toLowerCase()).toContain('block')
    })
  })

  describe('different block contexts', () => {
    test('should report empty function body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 3, 10)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty arrow function body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 5, 15)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty method body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 8, 8)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty catch block', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 12, 12)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty finally block', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 15, 10)

      visitor.BlockStatement(node)

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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
  })

  describe('comment edge cases', () => {
    test('should handle comment with incomplete loc', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'function test() {}', [
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function test() {}',
        comments,
      )
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('loc edge cases', () => {
    test('should handle node with non-number line in start', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
  })

  describe('config handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
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
  })

  describe('auto-fix', () => {
    test('should provide fix when node has range', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noEmptyRule.create(context)

      const node = createBlockStatement([], 1, 0)

      visitor.BlockStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})
