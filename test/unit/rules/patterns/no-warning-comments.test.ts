import { describe, expect, test, vi } from 'vitest'
import { noWarningCommentsRule } from '../../../../src/rules/patterns/no-warning-comments.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function createMockContext(source: string): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
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

function makeProgramNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'Program',
    body: [],
    loc: {
      start: { line: locStartLine, column: locStartCol },
      end: { line: locEndLine, column: locEndCol },
    },
  }
}

describe('no-warning-comments rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noWarningCommentsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noWarningCommentsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noWarningCommentsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noWarningCommentsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noWarningCommentsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning comment', () => {
      const desc = noWarningCommentsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/comment/)
    })

    test('should have correct docs URL', () => {
      expect(noWarningCommentsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-warning-comments',
      )
    })

    test('should have empty schema', () => {
      expect(noWarningCommentsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Program', () => {
      const { context } = createMockContext('')
      const visitor = noWarningCommentsRule.create(context)
      expect(visitor).toHaveProperty('Program')
      expect(typeof visitor.Program).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noWarningCommentsRule).toBeDefined()
      expect(noWarningCommentsRule.meta).toBeDefined()
      expect(noWarningCommentsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — FIXME DETECTION (7) =====

  describe('positive cases — FIXME detection', () => {
    test('reports FIXME in comment', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports fixme (lowercase) in comment', () => {
      const { context, reports } = createMockContext('// fixme')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports FixMe (mixed case) in comment', () => {
      const { context, reports } = createMockContext('// FixMe')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports FIXME with code before comment', () => {
      const { context, reports } = createMockContext('const x = 1; // FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports FIXME on second line', () => {
      const { context, reports } = createMockContext('const x = 1;\n// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('report message is correct for FIXME', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe("Unexpected 'FIXME' comment.")
    })

    test('reports FIXME with trailing text', () => {
      const { context, reports } = createMockContext('// FIXME: this is broken')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — HACK DETECTION (5) =====

  describe('positive cases — HACK detection', () => {
    test('reports HACK in comment', () => {
      const { context, reports } = createMockContext('// HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports hack (lowercase) in comment', () => {
      const { context, reports } = createMockContext('// hack')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('report message is correct for HACK', () => {
      const { context, reports } = createMockContext('// HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe("Unexpected 'HACK' comment.")
    })

    test('reports HACK with code before comment', () => {
      const { context, reports } = createMockContext('return val; // HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports HACK on second line', () => {
      const { context, reports } = createMockContext('const a = 1;\n// HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — XXX DETECTION (5) =====

  describe('positive cases — XXX detection', () => {
    test('reports XXX in comment', () => {
      const { context, reports } = createMockContext('// XXX')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports xxx (lowercase) in comment', () => {
      const { context, reports } = createMockContext('// xxx')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('report message is correct for XXX', () => {
      const { context, reports } = createMockContext('// XXX')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe("Unexpected 'XXX' comment.")
    })

    test('reports XXX with code before comment', () => {
      const { context, reports } = createMockContext('doStuff(); // XXX')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports XXX on second line', () => {
      const { context, reports } = createMockContext('const b = 2;\n// XXX')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — TODO DETECTION (5) =====

  describe('positive cases — TODO detection', () => {
    test('reports TODO in comment', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports todo (lowercase) in comment', () => {
      const { context, reports } = createMockContext('// todo')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('report message is correct for TODO', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe("Unexpected 'TODO' comment.")
    })

    test('reports TODO with code before comment', () => {
      const { context, reports } = createMockContext('fn(); // TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports TODO on second line', () => {
      const { context, reports } = createMockContext('const c = 3;\n// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (8) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      const node = makeProgramNode()
      visitor.Program(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line is 1 for first line', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('report loc start column is 0', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report loc end column equals line length', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.end.column).toBe('// FIXME'.length)
    })

    test('report loc for second line is line 2', () => {
      const { context, reports } = createMockContext('const x = 1;\n// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('report loc end column for second line', () => {
      const { context, reports } = createMockContext('const x = 1;\n// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.end.column).toBe('// TODO'.length)
    })
  })

  // ===== MULTI-LINE (10) =====

  describe('multi-line source', () => {
    test('reports two lines with FIXME', () => {
      const { context, reports } = createMockContext('// FIXME\n// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('reports two different terms on separate lines', () => {
      const { context, reports } = createMockContext('// FIXME\n// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('reports only once per line with multiple terms', () => {
      const { context, reports } = createMockContext('// FIXME TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports three comment lines correctly', () => {
      const { context, reports } = createMockContext('// FIXME\n// TODO\n// HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(3)
    })

    test('reports all four terms across four lines', () => {
      const { context, reports } = createMockContext('// FIXME\n// HACK\n// XXX\n// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(4)
    })

    test('accumulates reports across multiple Program calls', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('skips lines without comments', () => {
      const { context, reports } = createMockContext('const x = 1;\n// TODO\nconst y = 2;')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports first matching term when line has FIXME and TODO', () => {
      const { context, reports } = createMockContext('// FIXME TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("Unexpected 'FIXME' comment.")
    })

    test('reports correct total for mixed source', () => {
      const { context, reports } = createMockContext(
        'const a = 1;\n// FIXME\nconst b = 2;\n// regular\n// TODO',
      )
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('handles source with empty lines between comments', () => {
      const { context, reports } = createMockContext('// FIXME\n\n// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — NO COMMENTS (5) =====

  describe('negative cases — no comments', () => {
    test('does not report for source without comments', () => {
      const { context, reports } = createMockContext('const x = 1;')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for empty source', () => {
      const { context, reports } = createMockContext('')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for code only with no slashes', () => {
      const { context, reports } = createMockContext('function foo() { return 42; }')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report when source is empty string', () => {
      const { context, reports } = createMockContext('')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for source with only whitespace', () => {
      const { context, reports } = createMockContext('   \n   \n   ')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NO WARNING TERMS (5) =====

  describe('negative cases — no warning terms', () => {
    test('does not report for comment without warning terms', () => {
      const { context, reports } = createMockContext('// this is a regular comment')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for comment with NOTE', () => {
      const { context, reports } = createMockContext('// NOTE: important info')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for comment with BUG', () => {
      const { context, reports } = createMockContext('// BUGFIX applied here')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for comment with PERFORM', () => {
      const { context, reports } = createMockContext('// PERFORMANCE improvement')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for comment with FIXED', () => {
      const { context, reports } = createMockContext('// FIXED this issue')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NULL/NODE EDGE CASES (3) =====

  describe('negative cases — null/node edge cases', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(null)
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node with warning source', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program({})
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — SOURCE CONTENT (3) =====

  describe('negative cases — source content', () => {
    test('does not report for TODO in code before comment', () => {
      const { context, reports } = createMockContext('const TODO = 5; // regular')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for block comment style', () => {
      const { context, reports } = createMockContext('/* TODO: fix this */')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for source with only newlines', () => {
      const { context, reports } = createMockContext('\n\n\n')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (14) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext('// FIXME')
      const { context: ctx2, reports: rep2 } = createMockContext('// regular')
      const visitor1 = noWarningCommentsRule.create(ctx1)
      const visitor2 = noWarningCommentsRule.create(ctx2)
      visitor1.Program(makeProgramNode())
      visitor2.Program(makeProgramNode())
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      const node = {
        type: 'Program',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        extra: true,
        sourceType: 'module',
      }
      visitor.Program(node)
      expect(reports.length).toBe(1)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program({ type: 'Program', body: [] })
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext('')
      const visitor1 = noWarningCommentsRule.create(context)
      const visitor2 = noWarningCommentsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noWarningCommentsRule.meta
      const meta2 = noWarningCommentsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noWarningCommentsRule).toBeDefined()
      expect(typeof noWarningCommentsRule.create).toBe('function')
      expect(typeof noWarningCommentsRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext('// HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program({
        type: 'Program',
        body: [],
        _parent: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('reports FIXME: with colon format', () => {
      const { context, reports } = createMockContext('// FIXME: fix this later')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports TODO: with colon format', () => {
      const { context, reports } = createMockContext('// TODO: implement later')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for very long comment line', () => {
      const longComment = '// TODO ' + 'x'.repeat(200)
      const { context, reports } = createMockContext(longComment)
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('handles source with only a single comment', () => {
      const { context, reports } = createMockContext('// HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports when multiple comments have same term', () => {
      const { context, reports } = createMockContext('// TODO one\nconst x = 1;\n// TODO two')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe("Unexpected 'TODO' comment.")
      expect(reports[1].message).toBe("Unexpected 'TODO' comment.")
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(3)
    })

    test('reports for comment after code with semicolon', () => {
      const { context, reports } = createMockContext('x = foo(); // XXX workaround')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== MORE EDGE CASES (11) =====

  describe('more edge cases', () => {
    test('handles node with loc property', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program({
        type: 'Program',
        body: [],
        loc: { start: { line: 5, column: 2 }, end: { line: 10, column: 3 } },
      })
      expect(reports.length).toBe(1)
    })

    test('reports TODO with surrounding text', () => {
      const { context, reports } = createMockContext('// we should TODO this later')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports HACK with additional context text', () => {
      const { context, reports } = createMockContext('// HACK this is a temp workaround')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports XXX with additional context text', () => {
      const { context, reports } = createMockContext('// XXX needs review')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('handles source where // appears in string literal', () => {
      const { context, reports } = createMockContext("const url = 'http://example.com' // TODO fix")
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for comment with tab characters', () => {
      const { context, reports } = createMockContext('//\tTODO\tfix this')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for single line with just // TODO', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("Unexpected 'TODO' comment.")
    })

    test('report loc end column for multi-char line', () => {
      const source = 'const x = 1; // FIXME broken'
      const { context, reports } = createMockContext(source)
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.end.column).toBe(source.length)
    })

    test('does not report for comment with just double slashes', () => {
      const { context, reports } = createMockContext('//')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('reports for source with mixed valid and invalid lines', () => {
      const { context, reports } = createMockContext(
        'const a = 1;\n// FIXME\n// normal\nconst b = 2;\n// HACK',
      )
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('handles source with Windows-style CRLF line endings', () => {
      const { context, reports } = createMockContext('// TODO\r\n// HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext('// FIXME')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program({ type: 'Program', body: [], loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program({ type: 'Program', body: [], loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext('// HACK')
      const visitor = noWarningCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext('// TODO')
      const visitor = noWarningCommentsRule.create(context)
      expect(() => visitor.Program('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
