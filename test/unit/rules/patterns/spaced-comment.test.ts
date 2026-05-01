import { describe, expect, test, vi } from 'vitest'
import { spacedCommentRule } from '../../../../src/rules/patterns/spaced-comment.js'
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

function makeProgramNode(): unknown {
  return {
    type: 'Program',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 0 },
    },
  }
}

// ===== META TESTS (8) =====

describe('spaced-comment rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(spacedCommentRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(spacedCommentRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(spacedCommentRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(spacedCommentRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(spacedCommentRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning comment', () => {
      const desc = spacedCommentRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/comment/)
    })

    test('should have correct docs URL', () => {
      expect(spacedCommentRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/spaced-comment',
      )
    })

    test('should have empty schema', () => {
      expect(spacedCommentRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Program', () => {
      const { context } = createMockContext('')
      const visitor = spacedCommentRule.create(context)
      expect(visitor).toHaveProperty('Program')
      expect(typeof visitor.Program).toBe('function')
    })

    test('default export matches named export', () => {
      expect(spacedCommentRule).toBeDefined()
      expect(spacedCommentRule.meta).toBeDefined()
      expect(spacedCommentRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE // CASES — REPORTS (15) =====

  describe('positive // cases — reports missing space', () => {
    test('reports //comment without space', () => {
      const { context, reports } = createMockContext('//comment')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //TODO without space', () => {
      const { context, reports } = createMockContext('//TODO')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //fixme without space', () => {
      const { context, reports } = createMockContext('//fixme')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //! without space', () => {
      const { context, reports } = createMockContext('//!')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //x at start of line after code', () => {
      const { context, reports } = createMockContext('const x = 1; //x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //1 (digit after marker)', () => {
      const { context, reports } = createMockContext('//1')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //= without space', () => {
      const { context, reports } = createMockContext('//=')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //~ without space', () => {
      const { context, reports } = createMockContext('//~')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //_ (underscore after marker)', () => {
      const { context, reports } = createMockContext('///')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports http:// (false positive on URL)', () => {
      const { context, reports } = createMockContext('http://example.com')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //@ts-ignore without space', () => {
      const { context, reports } = createMockContext('//@ts-ignore')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //FIXME: without space', () => {
      const { context, reports } = createMockContext('//FIXME: fix this')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //; without space', () => {
      const { context, reports } = createMockContext('//;')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports //, without space', () => {
      const { context, reports } = createMockContext('//' + '.')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports two // lines without space', () => {
      const { context, reports } = createMockContext('//a\n//b')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })
  })

  // ===== POSITIVE /* CASES — REPORTS (15) =====

  describe('positive /* cases — reports missing space', () => {
    test('reports /*comment*/ without space', () => {
      const { context, reports } = createMockContext('/*comment*/')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*TODO*/ without space', () => {
      const { context, reports } = createMockContext('/*TODO*/')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*! without space', () => {
      const { context, reports } = createMockContext('/*!')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*= without space', () => {
      const { context, reports } = createMockContext('/*=')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*1 (digit after marker)', () => {
      const { context, reports } = createMockContext('/*1')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*x on line with code', () => {
      const { context, reports } = createMockContext('const a = 1; /*x*/')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*- without space', () => {
      const { context, reports } = createMockContext('/*-')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*_ without space', () => {
      const { context, reports } = createMockContext('/*_')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*@ without space', () => {
      const { context, reports } = createMockContext('/*@')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*# without space', () => {
      const { context, reports } = createMockContext('/*#')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*& without space', () => {
      const { context, reports } = createMockContext('/*&')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*( without space', () => {
      const { context, reports } = createMockContext('/*(')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*) without space', () => {
      const { context, reports } = createMockContext('/*)')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*note without space and no closing', () => {
      const { context, reports } = createMockContext('/*note')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports /*hello*/ without space', () => {
      const { context, reports } = createMockContext('/*hello*/')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (10) =====

  describe('report properties', () => {
    test('// report message says "Expected space after // comment marker."', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe('Expected space after // comment marker.')
    })

    test('/* report message says "Expected space after /* comment marker."', () => {
      const { context, reports } = createMockContext('/*x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe('Expected space after /* comment marker.')
    })

    test('// report has loc property', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('// report loc start column is index of //', () => {
      const { context, reports } = createMockContext('  //x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('// report loc end column is index + 3', () => {
      const { context, reports } = createMockContext('  //x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('// report loc line is 1 for first line', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('/* report loc start column is index of /*', () => {
      const { context, reports } = createMockContext('  /*x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('/* report loc end column is index + 3', () => {
      const { context, reports } = createMockContext('  /*x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('report node matches the Program node', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      const node = makeProgramNode()
      visitor.Program(node)
      expect(reports[0].node).toBe(node)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== MULTI-LINE (10) =====

  describe('multi-line', () => {
    test('reports violation on second line', () => {
      const { context, reports } = createMockContext('const a = 1;\n//x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('reports violations on multiple lines', () => {
      const { context, reports } = createMockContext('//a\n//b\n//c')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(3)
    })

    test('reports only the offending lines', () => {
      const { context, reports } = createMockContext('// ok\n//bad\nconst x = 1;\n/*x*/')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('reports line numbers correctly for multi-line source', () => {
      const { context, reports } = createMockContext('line1\nline2\n//bad')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('handles mixed // and /* on same line', () => {
      const { context, reports } = createMockContext('/*x*/ //y')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('handles /* on first line and // on second line', () => {
      const { context, reports } = createMockContext('/*x*/\n//y')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('empty lines between violations', () => {
      const { context, reports } = createMockContext('//a\n\n\n//b')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(4)
    })

    test('valid comments on multiple lines do not report', () => {
      const { context, reports } = createMockContext('// ok\n/* comment */\nconst x = 1;')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('reports /* violation on correct line number', () => {
      const { context, reports } = createMockContext('a\nb\n/*x*/')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('reports both types on separate lines with correct messages', () => {
      const { context, reports } = createMockContext('/*x*/\n//y')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe('Expected space after /* comment marker.')
      expect(reports[1].message).toBe('Expected space after // comment marker.')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (15) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for // with space', () => {
      const { context, reports } = createMockContext('// comment')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for // with tab', () => {
      const { context, reports } = createMockContext('//\tcomment')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for // at end of line (empty after)', () => {
      const { context, reports } = createMockContext('//')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for /* with space', () => {
      const { context, reports } = createMockContext('/* comment */')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for /* with tab', () => {
      const { context, reports } = createMockContext('/*\tcomment */')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for /** (JSDoc)', () => {
      const { context, reports } = createMockContext('/** JSDoc */')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for /*** (multiple stars)', () => {
      const { context, reports } = createMockContext('/*** comment */')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for code without comments', () => {
      const { context, reports } = createMockContext('const x = 1;')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for empty source', () => {
      const { context, reports } = createMockContext('')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for /* at end of line (empty after)', () => {
      const { context, reports } = createMockContext('/*')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for multiple valid // comments', () => {
      const { context, reports } = createMockContext('// a\n// b\n// c')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for // with space and longer text', () => {
      const { context, reports } = createMockContext('// This is a long comment')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for /* with space and longer text', () => {
      const { context, reports } = createMockContext('/* This is a block comment */')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for only whitespace source', () => {
      const { context, reports } = createMockContext('   \n   \n   ')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for string containing //', () => {
      const { context, reports } = createMockContext("const s = 'hello // world';")
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext('//x')
      const { context: ctx2, reports: rep2 } = createMockContext('// ok')
      const visitor1 = spacedCommentRule.create(ctx1)
      const visitor2 = spacedCommentRule.create(ctx2)
      visitor1.Program(makeProgramNode())
      visitor2.Program(makeProgramNode())
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext('')
      const visitor1 = spacedCommentRule.create(context)
      const visitor2 = spacedCommentRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = spacedCommentRule.meta
      const meta2 = spacedCommentRule.meta
      expect(meta1).toBe(meta2)
    })

    test('null node does not crash', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      expect(() => visitor.Program(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('undefined node does not crash', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      expect(() => visitor.Program(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('empty object node does not crash', () => {
      const { context, reports } = createMockContext('')
      const visitor = spacedCommentRule.create(context)
      expect(() => visitor.Program({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('string node does not crash', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      expect(() => visitor.Program('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('number node does not crash', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      expect(() => visitor.Program(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('boolean node does not crash', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      expect(() => visitor.Program(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('array node does not crash', () => {
      const { context, reports } = createMockContext('')
      const visitor = spacedCommentRule.create(context)
      expect(() => visitor.Program([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      const node = {
        type: 'Program',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        range: [0, 10],
        extra: true,
      }
      visitor.Program(node)
      expect(reports.length).toBe(1)
    })

    test('multiple Program calls on same visitor accumulate reports', () => {
      const { context, reports } = createMockContext('//x')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('rule exports are correct', () => {
      expect(spacedCommentRule).toBeDefined()
      expect(typeof spacedCommentRule.create).toBe('function')
      expect(typeof spacedCommentRule.meta).toBe('object')
    })

    test('source with only newlines does not report', () => {
      const { context, reports } = createMockContext('\n\n\n')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('/// triple slash reports (third slash is not space)', () => {
      const { context, reports } = createMockContext('///')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('//* star after // reports', () => {
      const { context, reports } = createMockContext('//*')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('//! bang comment reports', () => {
      const { context, reports } = createMockContext('/*!')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('// followed by unicode character reports', () => {
      const { context, reports } = createMockContext('//\u00e9')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('/* followed by newline then content on next line', () => {
      const { context, reports } = createMockContext('/*\n * comment\n */')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('visitor accumulates across mixed valid and invalid', () => {
      const { context, reports } = createMockContext('//a\n// ok\n/*x*/\n/* ok */\n//b')
      const visitor = spacedCommentRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(3)
    })
  })
})
