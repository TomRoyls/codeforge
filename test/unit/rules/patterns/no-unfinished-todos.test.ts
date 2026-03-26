import { describe, test, expect, vi } from 'vitest'
import { noUnfinishedTodosRule } from '../../../../src/rules/patterns/no-unfinished-todos.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '// TODO: fix this',
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

function createComment(text: string, line = 1, column = 0): unknown {
  return {
    type: 'Comment',
    text,
    loc: {
      start: { line, column },
      end: { line, column: column + text.length },
    },
  }
}

describe('no-unfinished-todos rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnfinishedTodosRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnfinishedTodosRule.meta.severity).toBe('warn')
    })

    test('should not be recommended by default', () => {
      expect(noUnfinishedTodosRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnfinishedTodosRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnfinishedTodosRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnfinishedTodosRule.meta.fixable).toBeUndefined()
    })

    test('should mention TODO in description', () => {
      expect(noUnfinishedTodosRule.meta.docs?.description).toContain('TODO')
    })

    test('should mention FIXME in description', () => {
      expect(noUnfinishedTodosRule.meta.docs?.description).toContain('FIXME')
    })

    test('should have terms option in schema', () => {
      const schema = noUnfinishedTodosRule.meta.schema as Array<{
        properties: { terms?: { type: string } }
      }>
      expect(schema[0]?.properties?.terms?.type).toBe('array')
    })

    test('should have allowPatterns option in schema', () => {
      const schema = noUnfinishedTodosRule.meta.schema as Array<{
        properties: { allowPatterns?: { type: string } }
      }>
      expect(schema[0]?.properties?.allowPatterns?.type).toBe('array')
    })
  })

  describe('create', () => {
    test('should return visitor object with visitNode method', () => {
      const { context } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(visitor).toHaveProperty('visitNode')
    })
  })

  describe('detecting default terms', () => {
    test('should report TODO comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: implement this'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('TODO')
    })

    test('should report FIXME comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME: this is broken'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('FIXME')
    })

    test('should report HACK comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// HACK: workaround'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('HACK')
    })

    test('should report XXX comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// XXX: dangerous'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('XXX')
    })

    test('should be case insensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// todo: lowercase'))
      visitor.visitNode(createComment('// Todo: mixed case'))
      visitor.visitNode(createComment('// TODO: uppercase'))

      expect(reports.length).toBe(3)
    })

    test('should require word boundary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODOS: not a match'))
      visitor.visitNode(createComment('// STUFFIX: not a match'))

      expect(reports.length).toBe(0)
    })
  })

  describe('allowing regular comments', () => {
    test('should not report regular comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// This is a regular comment'))
      visitor.visitNode(createComment('// Note: important info'))
      visitor.visitNode(createComment('// FIXME_something: not a match'))

      expect(reports.length).toBe(0)
    })

    test('should not report comments without special terms', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/* Multi-line comment\n   without special terms */'))

      expect(reports.length).toBe(0)
    })
  })

  describe('custom terms option', () => {
    test('should detect custom terms', () => {
      const { context, reports } = createMockContext({
        terms: ['BUG', 'ISSUE'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// BUG: found a bug'))
      visitor.visitNode(createComment('// ISSUE: needs fixing'))

      expect(reports.length).toBe(2)
    })

    test('should not detect default terms when custom terms are set', () => {
      const { context, reports } = createMockContext({
        terms: ['CUSTOM'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: this is a todo'))
      visitor.visitNode(createComment('// CUSTOM: this is custom'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('CUSTOM')
    })
  })

  describe('allowPatterns option', () => {
    test('should allow comments matching allowPatterns', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\[TRACKED\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [TRACKED]: ticket-123'))

      expect(reports.length).toBe(0)
    })

    test('should report comments not matching allowPatterns', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\[TRACKED\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: untracked'))

      expect(reports.length).toBe(1)
    })

    test('should support multiple allowPatterns', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\[TRACKED\\]', '\\[SNOOZE\\]', '#\\d+'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [TRACKED]: tracked'))
      visitor.visitNode(createComment('// TODO [SNOOZE]: snoozed'))
      visitor.visitNode(createComment('// TODO #123: has issue'))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include term in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: implement'))

      expect(reports[0].message).toContain('TODO')
    })

    test('should mention technical debt in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: implement'))

      expect(reports[0].message.toLowerCase()).toContain('technical debt')
    })

    test('should suggest addressing or removing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: implement'))

      expect(reports[0].message.toLowerCase()).toContain('addressing')
      expect(reports[0].message.toLowerCase()).toContain('removing')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode('string')).not.toThrow()
      expect(() => visitor.visitNode(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { text: '// TODO: test' }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'todo',
      }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = {
        type: 'Comment',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = {
        type: 'Comment',
        text: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = {
        type: 'Comment',
        text: '// TODO: test',
      }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test'))

      expect(reports.length).toBe(1)
    })

    test('should handle empty terms array', () => {
      const { context, reports } = createMockContext({ terms: [] })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test'))

      expect(reports.length).toBe(0)
    })

    test('should handle empty allowPatterns array', () => {
      const { context, reports } = createMockContext({ allowPatterns: [] })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test'))

      expect(reports.length).toBe(1)
    })

    test('should throw for invalid allowPatterns regex', () => {
      const { context } = createMockContext({
        allowPatterns: ['[invalid'],
      })

      expect(() => noUnfinishedTodosRule.create(context)).toThrow()
    })
  })

  describe('multiple violations', () => {
    test('should report multiple TODO comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: first'))
      visitor.visitNode(createComment('// FIXME: second'))
      visitor.visitNode(createComment('// HACK: third'))

      expect(reports.length).toBe(3)
    })

    test('should report TODO but not regular comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// This is normal'))
      visitor.visitNode(createComment('// TODO: this is not'))
      visitor.visitNode(createComment('// Also normal'))

      expect(reports.length).toBe(1)
    })
  })

  describe('comment formats', () => {
    test('should detect single-line comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: single line'))

      expect(reports.length).toBe(1)
    })

    test('should detect multi-line comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/* TODO: multi-line */'))

      expect(reports.length).toBe(1)
    })

    test('should detect block comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/** TODO: doc comment */'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in middle of comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// Consider this TODO when refactoring'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO at end of comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// Refactor later - TODO'))

      expect(reports.length).toBe(1)
    })
  })
})
