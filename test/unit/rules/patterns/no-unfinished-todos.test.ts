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

    test('should have a docs URL', () => {
      expect(noUnfinishedTodosRule.meta.docs?.url).toBeDefined()
      expect(typeof noUnfinishedTodosRule.meta.docs?.url).toBe('string')
    })

    test('should have docs URL containing rule name', () => {
      expect(noUnfinishedTodosRule.meta.docs?.url).toContain('no-unfinished-todos')
    })

    test('should have HACK in description', () => {
      expect(noUnfinishedTodosRule.meta.docs?.description).toContain('HACK')
    })

    test('should have object type as first schema element', () => {
      const schema = noUnfinishedTodosRule.meta.schema as Array<{ type: string }>
      expect(schema[0]?.type).toBe('object')
    })

    test('should have additionalProperties false in schema', () => {
      const schema = noUnfinishedTodosRule.meta.schema as Array<{
        additionalProperties: boolean
      }>
      expect(schema[0]?.additionalProperties).toBe(false)
    })

    test('should have string items type for terms in schema', () => {
      const schema = noUnfinishedTodosRule.meta.schema as Array<{
        properties: { terms?: { items: { type: string } } }
      }>
      expect(schema[0]?.properties?.terms?.items?.type).toBe('string')
    })

    test('should have string items type for allowPatterns in schema', () => {
      const schema = noUnfinishedTodosRule.meta.schema as Array<{
        properties: { allowPatterns?: { items: { type: string } } }
      }>
      expect(schema[0]?.properties?.allowPatterns?.items?.type).toBe('string')
    })

    test('should have description as non-empty string', () => {
      expect(noUnfinishedTodosRule.meta.docs?.description).toBeTruthy()
      expect(typeof noUnfinishedTodosRule.meta.docs?.description).toBe('string')
    })

    test('should have meta as a plain object', () => {
      expect(typeof noUnfinishedTodosRule.meta).toBe('object')
      expect(noUnfinishedTodosRule.meta).not.toBeNull()
    })

    test('should have recommended as boolean', () => {
      expect(typeof noUnfinishedTodosRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have severity as string', () => {
      expect(typeof noUnfinishedTodosRule.meta.severity).toBe('string')
    })

    test('should have type as string', () => {
      expect(typeof noUnfinishedTodosRule.meta.type).toBe('string')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noUnfinishedTodosRule.meta.schema)).toBe(true)
    })

    test('should have exactly two properties in schema object', () => {
      const schema = noUnfinishedTodosRule.meta.schema as Array<{
        properties: Record<string, unknown>
      }>
      expect(Object.keys(schema[0]?.properties ?? {})).toHaveLength(2)
    })
  })

  describe('create', () => {
    test('should return visitor object with visitNode method', () => {
      const { context } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(visitor).toHaveProperty('visitNode')
    })

    test('should return visitNode as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(typeof visitor.visitNode).toBe('function')
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnfinishedTodosRule.create(context)
      const visitor2 = noUnfinishedTodosRule.create(context)

      expect(visitor1).not.toBe(visitor2)
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

    test('should detect TODO with colon separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: refactor'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO without colon separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO refactor this'))

      expect(reports.length).toBe(1)
    })

    test('should detect FIXME with dash separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME - broken logic'))

      expect(reports.length).toBe(1)
    })

    test('should detect HACK at start of comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('HACK temporary fix'))

      expect(reports.length).toBe(1)
    })

    test('should detect XXX with parentheses', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// XXX (needs review)'))

      expect(reports.length).toBe(1)
    })

    test('should detect term followed by period', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO. Implement later'))

      expect(reports.length).toBe(1)
    })

    test('should detect term at very start of text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('TODO at the very beginning'))

      expect(reports.length).toBe(1)
    })

    test('should detect term after whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('  TODO: indented'))

      expect(reports.length).toBe(1)
    })

    test('should detect term followed by exclamation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME! Critical bug'))

      expect(reports.length).toBe(1)
    })

    test('should detect term followed by question mark', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO? Should we do this'))

      expect(reports.length).toBe(1)
    })

    test('should detect term followed by newline in multi-line text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/* TODO\n   Multi-line comment */'))

      expect(reports.length).toBe(1)
    })

    test('should detect term surrounded by spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// the TODO needs attention'))

      expect(reports.length).toBe(1)
    })

    test('should detect lowercase todo', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// todo: lowercase'))

      expect(reports.length).toBe(1)
    })

    test('should detect lowercase fixme', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// fixme: broken'))

      expect(reports.length).toBe(1)
    })

    test('should detect lowercase hack', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// hack: workaround'))

      expect(reports.length).toBe(1)
    })

    test('should detect lowercase xxx', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// xxx: dangerous'))

      expect(reports.length).toBe(1)
    })

    test('should detect mixed case Todo', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// Todo: mixed'))

      expect(reports.length).toBe(1)
    })

    test('should detect mixed case FixMe', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FixMe: broken'))

      expect(reports.length).toBe(1)
    })

    test('should detect mixed case HAcK', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// HAcK: workaround'))

      expect(reports.length).toBe(1)
    })

    test('should detect mixed case xXx', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// xXx: dangerous'))

      expect(reports.length).toBe(1)
    })

    test('should not detect TODOS as TODO', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODOS: many items'))

      expect(reports.length).toBe(0)
    })

    test('should not detect FIXMEEE as FIXME', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXMEEE: extended'))

      expect(reports.length).toBe(0)
    })

    test('should not detect HACKS as HACK', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// HACKS: multiple'))

      expect(reports.length).toBe(0)
    })

    test('should not detect XXXX as XXX', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// XXXX: extra'))

      expect(reports.length).toBe(0)
    })

    test('should not detect TODONT as TODO', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODONT: anti-pattern'))

      expect(reports.length).toBe(0)
    })

    test('should not detect BHACK as HACK', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// BHACK: unrelated word'))

      expect(reports.length).toBe(0)
    })

    test('should not detect PREFIXEDFIXME as FIXME', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// PREFIXEDFIXME: no match'))

      expect(reports.length).toBe(0)
    })

    test('should detect term preceded by opening parenthesis', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// (TODO: implement later)'))

      expect(reports.length).toBe(1)
    })

    test('should detect term preceded by opening bracket', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// [TODO: track this]'))

      expect(reports.length).toBe(1)
    })

    test('should detect term preceded by newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/* line1\nTODO: second line */'))

      expect(reports.length).toBe(1)
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

    test('should not report empty comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment(''))

      expect(reports.length).toBe(0)
    })

    test('should not report whitespace-only comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('   '))
      visitor.visitNode(createComment('\t'))
      visitor.visitNode(createComment('\n'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment that just has the word todolist', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// todolist application'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment with word fixable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// This is fixable'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment with word hacking', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// ethical hacking'))

      expect(reports.length).toBe(0)
    })

    test('should not report comments about video content (xxxtended)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// XXXTENTACION lyrics'))

      expect(reports.length).toBe(0)
    })

    test('should not report comments about ToDO list app', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// ToDoList component'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment about methodologies', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// Methodologies: agile, scrum'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment with NOTE keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// NOTE: This is just a note'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment with WARNING keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// WARNING: deprecated API'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment with DEPRECATED keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// DEPRECATED: use new API'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment with IMPORTANT keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// IMPORTANT: read carefully'))

      expect(reports.length).toBe(0)
    })

    test('should not report comment with SEE keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// SEE: documentation'))

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

    test('should detect single custom term', () => {
      const { context, reports } = createMockContext({
        terms: ['OPTIMIZE'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// OPTIMIZE: improve perf'))

      expect(reports.length).toBe(1)
    })

    test('should detect custom term in mixed case', () => {
      const { context, reports } = createMockContext({
        terms: ['OPTIMIZE'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// optimize: lowercase'))
      visitor.visitNode(createComment('// Optimize: mixed'))

      expect(reports.length).toBe(2)
    })

    test('should detect multiple custom terms', () => {
      const { context, reports } = createMockContext({
        terms: ['REFACTOR', 'CLEANUP', 'REVIEW'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// REFACTOR: needs work'))
      visitor.visitNode(createComment('// CLEANUP: messy code'))
      visitor.visitNode(createComment('// REVIEW: check this'))

      expect(reports.length).toBe(3)
    })

    test('should not match default terms when overridden with custom', () => {
      const { context, reports } = createMockContext({
        terms: ['REVIEW'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: default term'))
      visitor.visitNode(createComment('// FIXME: default term'))
      visitor.visitNode(createComment('// HACK: default term'))
      visitor.visitNode(createComment('// XXX: default term'))
      visitor.visitNode(createComment('// REVIEW: custom term'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('REVIEW')
    })

    test('should handle custom term with numbers', () => {
      const { context, reports } = createMockContext({
        terms: ['V2TODO'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// V2TODO: migrate'))

      expect(reports.length).toBe(1)
    })

    test('should handle single character custom term', () => {
      const { context, reports } = createMockContext({
        terms: ['Q'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// Q: question here'))

      expect(reports.length).toBe(1)
    })

    test('should handle long custom term', () => {
      const { context, reports } = createMockContext({
        terms: ['NEEDSATTENTION'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// NEEDSATTENTION: urgent'))

      expect(reports.length).toBe(1)
    })

    test('should handle custom term with word boundary before period', () => {
      const { context, reports } = createMockContext({
        terms: ['WIP'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// WIP. Still working'))

      expect(reports.length).toBe(1)
    })

    test('should respect word boundary for custom terms', () => {
      const { context, reports } = createMockContext({
        terms: ['WIP'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// WIPWORK: not a match'))

      expect(reports.length).toBe(0)
    })

    test('should handle custom term at end of comment', () => {
      const { context, reports } = createMockContext({
        terms: ['REFACTOR'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// This needs REFACTOR'))

      expect(reports.length).toBe(1)
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

    test('should allow pattern matching any part of comment', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['JIRA-\\d+'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: linked to JIRA-456'))

      expect(reports.length).toBe(0)
    })

    test('should allow pattern with ticket prefix', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['^// TODO \\['],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [TICKET-1]: has ticket'))

      expect(reports.length).toBe(0)
    })

    test('should allow pattern matching FIXME with ticket', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['TICKET-\\d+'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME TICKET-789: tracked fix'))

      expect(reports.length).toBe(0)
    })

    test('should report when allowPattern partially matches', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['NOPE-\\d{5}'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO NOPE-123: only 3 digits'))

      expect(reports.length).toBe(1)
    })

    test('should allow dots in allowPattern', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\.com'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO example.com tracked'))

      expect(reports.length).toBe(0)
    })

    test('should allow with wildcard pattern', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['TRACKED-.*'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO TRACKED-abc-123: any suffix'))

      expect(reports.length).toBe(0)
    })

    test('should allow pattern with alternation', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\[TRACKED\\]|\\[SNOOZE\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [TRACKED]: tracked'))
      visitor.visitNode(createComment('// TODO [SNOOZE]: snoozed'))

      expect(reports.length).toBe(0)
    })

    test('should allow pattern with character class', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['#[A-Z]+-\\d+'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO #PROJ-42: project ticket'))

      expect(reports.length).toBe(0)
    })

    test('should still report when allowPattern does not match any term comment', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\[TRACKED\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// Regular comment'))
      visitor.visitNode(createComment('// Another normal comment'))

      expect(reports.length).toBe(0)
    })

    test('should handle allowPattern with unicode', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['✅'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO ✅: done'))

      expect(reports.length).toBe(0)
    })
  })

  describe('combined terms and allowPatterns', () => {
    test('should allow custom term with allowPattern', () => {
      const { context, reports } = createMockContext({
        terms: ['REVIEW', 'OPTIMIZE'],
        allowPatterns: ['\\[DEFERRED\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// REVIEW [DEFERRED]: later'))
      visitor.visitNode(createComment('// OPTIMIZE: not deferred'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('OPTIMIZE')
    })

    test('should apply allowPatterns to all custom terms', () => {
      const { context, reports } = createMockContext({
        terms: ['REVIEW', 'OPTIMIZE', 'CLEANUP'],
        allowPatterns: ['\\[TRACKED\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// REVIEW [TRACKED]: ok'))
      visitor.visitNode(createComment('// OPTIMIZE [TRACKED]: ok'))
      visitor.visitNode(createComment('// CLEANUP [TRACKED]: ok'))

      expect(reports.length).toBe(0)
    })

    test('should report all non-allowed custom terms', () => {
      const { context, reports } = createMockContext({
        terms: ['REVIEW', 'OPTIMIZE'],
        allowPatterns: ['\\[TRACKED\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// REVIEW: untracked'))
      visitor.visitNode(createComment('// OPTIMIZE: untracked'))

      expect(reports.length).toBe(2)
    })

    test('should handle empty terms with allowPatterns', () => {
      const { context, reports } = createMockContext({
        terms: [],
        allowPatterns: ['\\[TRACKED\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: would match defaults but terms empty'))

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

    test('should include TODO in uppercase in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// todo: lowercase input'))

      expect(reports[0].message).toContain('TODO')
    })

    test('should include FIXME in uppercase in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// fixme: lowercase input'))

      expect(reports[0].message).toContain('FIXME')
    })

    test('should include HACK in uppercase in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// hack: lowercase input'))

      expect(reports[0].message).toContain('HACK')
    })

    test('should include XXX in uppercase in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// xxx: lowercase input'))

      expect(reports[0].message).toContain('XXX')
    })

    test('should include custom term in uppercase in message', () => {
      const { context, reports } = createMockContext({
        terms: ['REVIEW'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// review: lowercase'))

      expect(reports[0].message).toContain('REVIEW')
    })

    test('should produce consistent message format for all default terms', () => {
      const terms = ['TODO', 'FIXME', 'HACK', 'XXX']
      for (const term of terms) {
        const { context, reports } = createMockContext()
        const visitor = noUnfinishedTodosRule.create(context)

        visitor.visitNode(createComment(`// ${term}: test`))

        expect(reports[0].message).toMatch(
          /Found .* comment\. Consider addressing or removing it to reduce technical debt\./,
        )
      }
    })

    test('should produce message matching known pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test'))

      expect(reports[0].message).toBe(
        'Found TODO comment. Consider addressing or removing it to reduce technical debt.',
      )
    })

    test('should produce message with FIXME for fixme term', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME: test'))

      expect(reports[0].message).toBe(
        'Found FIXME comment. Consider addressing or removing it to reduce technical debt.',
      )
    })

    test('should produce message with HACK for hack term', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// HACK: test'))

      expect(reports[0].message).toBe(
        'Found HACK comment. Consider addressing or removing it to reduce technical debt.',
      )
    })

    test('should produce message with XXX for xxx term', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// XXX: test'))

      expect(reports[0].message).toBe(
        'Found XXX comment. Consider addressing or removing it to reduce technical debt.',
      )
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

    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(true)).not.toThrow()
      expect(() => visitor.visitNode(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(0)).not.toThrow()
      expect(() => visitor.visitNode(-1)).not.toThrow()
      expect(() => visitor.visitNode(3.14)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { type: '', text: '// TODO: test' }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { type: 42, text: '// TODO: test' }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { type: 'Comment', text: undefined }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { type: 'Comment', text: 12345 }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with object text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { type: 'Comment', text: { toString: () => '// TODO: lazy' } }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with array text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { type: 'Comment', text: ['TODO'] }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle very long comment text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const longComment = '// ' + 'x'.repeat(10000) + ' TODO: at the end'
      visitor.visitNode(createComment(longComment))

      expect(reports.length).toBe(1)
    })

    test('should handle comment with unicode characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: 日本語テスト 🎉'))

      expect(reports.length).toBe(1)
    })

    test('should handle comment with emoji before term', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// 🔧 TODO: emoji before'))

      expect(reports.length).toBe(1)
    })

    test('should handle comment with special regex characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: $1.00 for (a+b)*c'))

      expect(reports.length).toBe(1)
    })

    test('should handle comment with backslashes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: C:\\Users\\path'))

      expect(reports.length).toBe(1)
    })

    test('should handle comment with HTML entities', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: &amp; &lt; &gt;'))

      expect(reports.length).toBe(1)
    })

    test('should handle location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test', 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle location at large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test', 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle valid allowPatterns regex with anchors', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['^// TODO'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: at start'))

      expect(reports.length).toBe(0)
    })

    test('should throw for unclosed parenthesis regex', () => {
      const { context } = createMockContext({
        allowPatterns: ['(unclosed'],
      })

      expect(() => noUnfinishedTodosRule.create(context)).toThrow()
    })

    test('should throw for unclosed bracket regex', () => {
      const { context } = createMockContext({
        allowPatterns: ['[unclosed'],
      })

      expect(() => noUnfinishedTodosRule.create(context)).toThrow()
    })

    test('should handle node type case sensitivity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { type: 'comment', text: '// TODO: test' }
      visitor.visitNode(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node type COMMENT uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = { type: 'COMMENT', text: '// TODO: test' }
      visitor.visitNode(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Infinity node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(Number.POSITIVE_INFINITY)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle BigInt node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(BigInt(123))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(/TODO/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Map node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(new Map())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Set node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      expect(() => visitor.visitNode(new Set())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle frozen object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = Object.freeze({ type: 'Comment', text: '// TODO: test' })
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle sealed object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = Object.seal({ type: 'Comment', text: '// TODO: test' })
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = Object.create({ type: 'Comment', text: '// TODO: test' })
      expect(() => visitor.visitNode(node)).not.toThrow()
    })

    test('should handle node with getter for text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const node = {
        type: 'Comment',
        get text() {
          return '// TODO: lazy'
        },
      }
      expect(() => visitor.visitNode(node)).not.toThrow()
      expect(reports.length).toBe(1)
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

    test('should report all four default terms', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: first'))
      visitor.visitNode(createComment('// FIXME: second'))
      visitor.visitNode(createComment('// HACK: third'))
      visitor.visitNode(createComment('// XXX: fourth'))

      expect(reports.length).toBe(4)
    })

    test('should report multiple of same term type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: first'))
      visitor.visitNode(createComment('// TODO: second'))
      visitor.visitNode(createComment('// TODO: third'))

      expect(reports.length).toBe(3)
    })

    test('should report correct count for mixed comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// Normal'))
      visitor.visitNode(createComment('// TODO: report'))
      visitor.visitNode(createComment('// Normal'))
      visitor.visitNode(createComment('// FIXME: report'))
      visitor.visitNode(createComment('// Normal'))
      visitor.visitNode(createComment('// HACK: report'))
      visitor.visitNode(createComment('// Normal'))

      expect(reports.length).toBe(3)
    })

    test('should handle many comments without terms', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.visitNode(createComment(`// Comment ${i}`))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle many comments all with terms', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.visitNode(createComment(`// TODO: item ${i}`))
      }

      expect(reports.length).toBe(50)
    })

    test('should report each term individually even with multiple terms in one comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO FIXME HACK XXX: all terms'))

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

    test('should detect term in hash comment style', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('# TODO: python-style'))

      expect(reports.length).toBe(1)
    })

    test('should detect term in HTML comment style', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('<!-- TODO: HTML comment -->'))

      expect(reports.length).toBe(1)
    })

    test('should detect term in triple-slash comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/// TODO: XML doc'))

      expect(reports.length).toBe(1)
    })

    test('should detect term in JSDoc style comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/**\n * TODO: JSDoc\n */'))

      expect(reports.length).toBe(1)
    })

    test('should detect term with leading asterisk in block comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment(' * TODO: indented block'))

      expect(reports.length).toBe(1)
    })

    test('should detect term in comment with code reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO(refs #123): linked'))

      expect(reports.length).toBe(1)
    })

    test('should detect term in comment with author attribution', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO(john): assigned'))

      expect(reports.length).toBe(1)
    })

    test('should detect term in comment with priority marker', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO!: high priority'))

      expect(reports.length).toBe(1)
    })

    test('should detect term in comment with date', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO(2024-01-15): deadline'))

      expect(reports.length).toBe(1)
    })

    test('should detect term in multi-line block comment spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/*\n * First line\n * TODO: third line\n * Last line\n */'))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report location from comment node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test', 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test'))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at zero line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test', 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should report location with different line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test', 42, 17))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
    })

    test('should report location for each violation separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: first', 1, 0))
      visitor.visitNode(createComment('// FIXME: second', 5, 4))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(4)
    })

    test('should include end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: test', 3, 2))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })
  })

  describe('visitor independence', () => {
    test('visitors from different create calls should be independent', () => {
      const { context: ctx1, reports: reports1 } = createMockContext({
        terms: ['TODO'],
      })
      const { context: ctx2, reports: reports2 } = createMockContext({
        terms: ['FIXME'],
      })

      const visitor1 = noUnfinishedTodosRule.create(ctx1)
      const visitor2 = noUnfinishedTodosRule.create(ctx2)

      visitor1.visitNode(createComment('// TODO: match'))
      visitor1.visitNode(createComment('// FIXME: no match for ctx1'))

      visitor2.visitNode(createComment('// FIXME: match'))
      visitor2.visitNode(createComment('// TODO: no match for ctx2'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('reports should not leak between visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noUnfinishedTodosRule.create(ctx1)
      const visitor2 = noUnfinishedTodosRule.create(ctx2)

      visitor1.visitNode(createComment('// TODO: test'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })
  })

  describe('first matching term wins', () => {
    test('should report TODO when comment has TODO and FIXME', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO FIXME: both terms'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('TODO')
    })

    test('should report FIXME when comment has FIXME and HACK', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME HACK: both terms'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('FIXME')
    })

    test('should report TODO when all four terms present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO FIXME HACK XXX: all terms'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('TODO')
    })

    test('should report first custom term when multiple present', () => {
      const { context, reports } = createMockContext({
        terms: ['ALPHA', 'BETA', 'GAMMA'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// BETA ALPHA: both present'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ALPHA')
    })
  })

  describe('allowPatterns filtering', () => {
    test('should not report when allowPattern matches but term is not first', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\[OK\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [OK]: tracked'))

      expect(reports.length).toBe(0)
    })

    test('should still report when allowPattern does not match', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\[NOPE\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [OK]: different pattern'))

      expect(reports.length).toBe(1)
    })

    test('should handle allowPattern that matches multiple times', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['TODO'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: the pattern matches TODO'))

      expect(reports.length).toBe(0)
    })

    test('should allow when any of multiple allowPatterns matches', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['NOMATCH', '\\[TRACKED\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [TRACKED]: second pattern matches'))

      expect(reports.length).toBe(0)
    })
  })

  describe('special comment content', () => {
    test('should detect TODO in comment with URLs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: see https://example.com'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in comment with code snippets', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: replace foo.bar() with baz.qux()'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in comment with JSON', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: parse {"key": "value"}'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in comment with Markdown-like formatting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: **bold** and _italic_'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in comment with tabs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('//\tTODO:\ttabbed'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in comment with carriage returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO:\r\nmultiline'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in very short comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('TODO'))

      expect(reports.length).toBe(1)
    })

    test('should detect FIXME in minimal comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('FIXME'))

      expect(reports.length).toBe(1)
    })

    test('should detect HACK in minimal comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('HACK'))

      expect(reports.length).toBe(1)
    })

    test('should detect XXX in minimal comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('XXX'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO surrounded by punctuation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// [TODO]: bracketed'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in comment with multiple spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('//   TODO:   extra   spaces'))

      expect(reports.length).toBe(1)
    })
  })

  describe('repeated visitNode calls', () => {
    test('should accumulate reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: one'))
      visitor.visitNode(createComment('// TODO: two'))
      visitor.visitNode(createComment('// TODO: three'))

      expect(reports).toHaveLength(3)
    })

    test('should handle interleaved valid and invalid comments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// Normal'))
      visitor.visitNode(createComment('// TODO: report 1'))
      visitor.visitNode(createComment('// Normal'))
      visitor.visitNode(createComment('// FIXME: report 2'))
      visitor.visitNode(createComment('// Normal'))

      expect(reports).toHaveLength(2)
      expect(reports[0].message).toContain('TODO')
      expect(reports[1].message).toContain('FIXME')
    })

    test('should handle same node visited twice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      const comment = createComment('// TODO: visited twice')
      visitor.visitNode(comment)
      visitor.visitNode(comment)

      expect(reports).toHaveLength(2)
    })
  })

  describe('allowPatterns with special regex features', () => {
    test('should handle allowPattern with lookahead', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['TODO(?=\\s*\\[TRACKED\\])'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [TRACKED]: lookahead match'))

      expect(reports.length).toBe(0)
    })

    test('should handle allowPattern with word boundary', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\bTRACKED\\b'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO TRACKED: word boundary'))

      expect(reports.length).toBe(0)
    })

    test('should handle allowPattern with case-insensitive flag not set', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['TRACKED'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO tracked: lowercase'))

      expect(reports.length).toBe(1)
    })

    test('should handle allowPattern matching digits only', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\d{4,}'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: ticket #12345'))
      visitor.visitNode(createComment('// TODO: ticket #12'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('TODO')
    })

    test('should handle allowPattern with start anchor', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['^// '],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: starts with // '))

      expect(reports.length).toBe(0)
    })

    test('should handle allowPattern with end anchor', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['done$'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: done'))

      expect(reports.length).toBe(0)
    })
  })

  describe('options variations', () => {
    test('should work with only terms option', () => {
      const { context, reports } = createMockContext({
        terms: ['CUSTOM'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// CUSTOM: match'))

      expect(reports.length).toBe(1)
    })

    test('should work with only allowPatterns option', () => {
      const { context, reports } = createMockContext({
        allowPatterns: ['\\[SKIP\\]'],
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO [SKIP]: skipped'))
      visitor.visitNode(createComment('// TODO: not skipped'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '// TODO: fix this',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [undefined] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnfinishedTodosRule.create(context)
      visitor.visitNode(createComment('// TODO: test'))

      expect(reports.length).toBe(1)
    })

    test('should handle null options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '// TODO: fix this',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnfinishedTodosRule.create(context)
      visitor.visitNode(createComment('// TODO: test'))

      expect(reports.length).toBe(1)
    })

    test('should handle config with extra unknown options', () => {
      const { context, reports } = createMockContext({
        terms: ['TODO'],
        unknownOption: 'ignored',
      })
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: still works'))

      expect(reports.length).toBe(1)
    })
  })

  describe('term matching priority', () => {
    test('should detect TODO before FIXME in text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO and FIXME'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('TODO')
    })

    test('should detect FIXME before HACK in text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME and HACK'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('FIXME')
    })

    test('should detect HACK before XXX in text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// HACK and XXX'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('HACK')
    })
  })

  describe('real-world comment patterns', () => {
    test('should detect TODO with assignee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO(john.doe): implement auth'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO with ticket reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO(#1234): related to ticket'))

      expect(reports.length).toBe(1)
    })

    test('should detect FIXME with URL', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME: see https://bugs.example.com/123'))

      expect(reports.length).toBe(1)
    })

    test('should detect HACK with explanation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(
        createComment('// HACK: Using eval because parser is broken, replace when fixed'),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect XXX with warning', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// XXX: This will break on edge case!'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in TypeScript triple-slash reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/// TODO: remove after migration'))

      expect(reports.length).toBe(1)
    })

    test('should detect FIXME in CSS-like comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('/* FIXME: override needed */'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO with date annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO(2024-12-31): deadline'))

      expect(reports.length).toBe(1)
    })

    test('should detect FIXME with priority', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME(P0): critical'))

      expect(reports.length).toBe(1)
    })

    test('should detect HACK in legacy code comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// HACK: Legacy code, do not touch without QA'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO with multiline description', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(
        createComment(
          '// TODO: This is a long description\n// that spans multiple lines\n// and explains what needs to be done',
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect FIXME in error handler comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME: Handle edge case in catch block'))

      expect(reports.length).toBe(1)
    })

    test('should detect XXX in performance comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// XXX: O(n^2) algorithm, needs optimization'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO in config comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO: Move to environment variable'))

      expect(reports.length).toBe(1)
    })

    test('should detect FIXME in security comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// FIXME: SQL injection vulnerability'))

      expect(reports.length).toBe(1)
    })

    test('should detect TODO with context tag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnfinishedTodosRule.create(context)

      visitor.visitNode(createComment('// TODO[perf]: optimize this'))

      expect(reports.length).toBe(1)
    })
  })
})
