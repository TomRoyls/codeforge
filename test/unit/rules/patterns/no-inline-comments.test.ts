import { describe, expect, test, vi } from 'vitest'
import { noInlineCommentsRule } from '../../../../src/rules/patterns/no-inline-comments.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function createMockContext(
  source: string,
): { context: RuleContext; reports: ReportDescriptor[] } {
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
  return { type: 'Program', body: [] }
}

// ===== META TESTS (8) =====

describe('no-inline-comments rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noInlineCommentsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noInlineCommentsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noInlineCommentsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noInlineCommentsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noInlineCommentsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning inline comments', () => {
      const desc = noInlineCommentsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/inline/)
    })

    test('should have correct docs URL', () => {
      expect(noInlineCommentsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-inline-comments',
      )
    })

    test('should have empty schema', () => {
      expect(noInlineCommentsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Program', () => {
      const { context } = createMockContext('')
      const visitor = noInlineCommentsRule.create(context)
      expect(visitor).toHaveProperty('Program')
      expect(typeof visitor.Program).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noInlineCommentsRule).toBeDefined()
      expect(noInlineCommentsRule.meta).toBeDefined()
      expect(noInlineCommentsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS INLINE COMMENT (35) =====

  describe('positive cases — reports inline comment', () => {
    test('reports for code with inline comment "let x = 1; // comment"', () => {
      const { context, reports } = createMockContext('let x = 1; // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('report message is "Unexpected inline comment."', () => {
      const { context, reports } = createMockContext('let x = 1; // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe('Unexpected inline comment.')
    })

    test('report loc start column points to // position', () => {
      const { context, reports } = createMockContext('let x = 1; // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.column).toBe(11)
    })

    test('report loc start line is 1 for first line', () => {
      const { context, reports } = createMockContext('let x = 1; // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('report loc end column points after //', () => {
      const { context, reports } = createMockContext('let x = 1; // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext('let x = 1; // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input Program node', () => {
      const { context, reports } = createMockContext('let x = 1; // comment')
      const visitor = noInlineCommentsRule.create(context)
      const node = makeProgramNode()
      visitor.Program(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for inline comment with single space before //', () => {
      const { context, reports } = createMockContext('x // inline')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment with no space before //', () => {
      const { context, reports } = createMockContext('x// inline')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after function call', () => {
      const { context, reports } = createMockContext('foo() // call')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after return statement', () => {
      const { context, reports } = createMockContext('return 42; // value')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after string assignment', () => {
      const { context, reports } = createMockContext('const s = "hello"; // greeting')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment with trailing code after //', () => {
      const { context, reports } = createMockContext('let a = 1; // TODO fix this')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for single character before inline comment', () => {
      const { context, reports } = createMockContext('a // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment on second line', () => {
      const { context, reports } = createMockContext('// standalone\nlet x = 1; // inline')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('report for second line has line number 2', () => {
      const { context, reports } = createMockContext('// standalone\nlet x = 1; // inline')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('reports for multiple inline comments on different lines', () => {
      const { context, reports } = createMockContext('a // one\nb // two\nc // three')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(3)
    })

    test('reports for inline comment with only tab before //', () => {
      const { context, reports } = createMockContext('x\t// tabbed comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment at end of if statement', () => {
      const { context, reports } = createMockContext('if (true) { // inline')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after console.log', () => {
      const { context, reports } = createMockContext('console.log("hi"); // debug')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment with multi-word code before //', () => {
      const { context, reports } = createMockContext('const foo = bar; // assign')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after closing brace', () => {
      const { context, reports } = createMockContext('} // end block')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after number literal', () => {
      const { context, reports } = createMockContext('42 // number comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment with long code line', () => {
      const { context, reports } = createMockContext(
        'const result = calculateSomethingVeryLong(input1, input2); // long line',
      )
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after export statement', () => {
      const { context, reports } = createMockContext('export default foo; // export')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after import statement', () => {
      const { context, reports } = createMockContext("import { x } from 'y'; // import")
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment with semicolon right before //', () => {
      const { context, reports } = createMockContext('x = 1;// no space')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment with mixed content before //', () => {
      const { context, reports } = createMockContext('if (a > b) { // comparison')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after array literal', () => {
      const { context, reports } = createMockContext('const arr = [1, 2, 3]; // array')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after object literal', () => {
      const { context, reports } = createMockContext('const obj = { a: 1 }; // object')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after throw statement', () => {
      const { context, reports } = createMockContext("throw new Error('fail'); // error")
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after try block', () => {
      const { context, reports } = createMockContext('try { // try block')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('report loc column is correct for offset code', () => {
      const { context, reports } = createMockContext('    x = 1; // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.column).toBe(11)
    })

    test('reports for inline comment after async function', () => {
      const { context, reports } = createMockContext('async function foo() { // async')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports for inline comment after arrow function', () => {
      const { context, reports } = createMockContext('const fn = () => {}; // arrow')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext('x // one')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for standalone comment "// standalone"', () => {
      const { context, reports } = createMockContext('// standalone comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for standalone comment with leading whitespace', () => {
      const { context, reports } = createMockContext('    // standalone with indent')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for standalone comment with leading tab', () => {
      const { context, reports } = createMockContext('\t// standalone with tab')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for code without any comments', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for empty source', () => {
      const { context, reports } = createMockContext('')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for only whitespace line', () => {
      const { context, reports } = createMockContext('   ')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for multi-line code with no comments', () => {
      const { context, reports } = createMockContext('let x = 1;\nlet y = 2;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for block comment /* ... */', () => {
      const { context, reports } = createMockContext('let x = 1; /* block */')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for standalone comment on line 2', () => {
      const { context, reports } = createMockContext('let x = 1;\n// standalone on line 2')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext('x // comment')
      const visitor = noInlineCommentsRule.create(context)
      expect(() => visitor.Program(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext('x // comment')
      const visitor = noInlineCommentsRule.create(context)
      expect(() => visitor.Program(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext('x // comment')
      const visitor = noInlineCommentsRule.create(context)
      expect(() => visitor.Program('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext('x // comment')
      const visitor = noInlineCommentsRule.create(context)
      expect(() => visitor.Program(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext('x // comment')
      const visitor = noInlineCommentsRule.create(context)
      expect(() => visitor.Program(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      expect(() => visitor.Program([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      expect(() => visitor.Program({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('reports for URL containing // in string (rule limitation)', () => {
      const { context, reports } = createMockContext("const url = 'https://example.com';")
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('does not report for only newlines', () => {
      const { context, reports } = createMockContext('\n\n\n')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for multiple standalone comments', () => {
      const { context, reports } = createMockContext('// line 1\n// line 2\n// line 3')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for standalone comment with extra indentation', () => {
      const { context, reports } = createMockContext('      // deeply indented')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for mixed standalone comments and code without inline', () => {
      const { context, reports } = createMockContext('// header\nlet x = 1;\n// footer')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report when source has only spaces and //', () => {
      const { context, reports } = createMockContext('   // only whitespace before')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program({ type: 'Identifier', name: 'foo' })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program({ type: 'Literal', value: 'test' })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program({ type: 'ExpressionStatement', expression: {} })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] } })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program({ type: 'BlockStatement', body: [] })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program({ type: 'VariableDeclaration', declarations: [], kind: 'const' })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program({ type: 'ReturnStatement', argument: null })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext('let x = 1;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program({ type: 'CallExpression', callee: {}, arguments: [] })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext('x // inline')
      const { context: ctx2, reports: rep2 } = createMockContext('// standalone')
      const visitor1 = noInlineCommentsRule.create(ctx1)
      const visitor2 = noInlineCommentsRule.create(ctx2)
      visitor1.Program(makeProgramNode())
      visitor2.Program(makeProgramNode())
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('mixed standalone and inline comments report only inline', () => {
      const { context, reports } = createMockContext('// standalone\nlet x = 1; // inline\n// another standalone')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('report for mixed comments reports correct line number', () => {
      const { context, reports } = createMockContext('// standalone\nlet x = 1; // inline')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext('a // inline')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(3)
    })

    test('all reports have the same message', () => {
      const { context, reports } = createMockContext('a // one\nb // two')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext('')
      const visitor1 = noInlineCommentsRule.create(context)
      const visitor2 = noInlineCommentsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noInlineCommentsRule.meta
      const meta2 = noInlineCommentsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext('x // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext('x // comment')
      const visitor = noInlineCommentsRule.create(context)
      const node = { type: 'Program', body: [], range: [0, 5], extra: true }
      visitor.Program(node)
      expect(reports.length).toBe(1)
    })

    test('handles URL in code that is not in a string', () => {
      const { context, reports } = createMockContext('let x = 1; // https://example.com')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(noInlineCommentsRule).toBeDefined()
      expect(typeof noInlineCommentsRule.create).toBe('function')
      expect(typeof noInlineCommentsRule.meta).toBe('object')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext('x // comment')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe('Unexpected inline comment.')
    })

    test('reports for inline comment on third line', () => {
      const code = '// line 1\n// line 2\nlet x = 1; // line 3'
      const { context, reports } = createMockContext(code)
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('reports multiple inline comments with correct line numbers', () => {
      const code = 'a // line 1\n// standalone\nb // line 3'
      const { context, reports } = createMockContext(code)
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('reports correct column for multiple inline comments', () => {
      const code = 'a // first\n   b // second'
      const { context, reports } = createMockContext(code)
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('reports for inline comment after template literal', () => {
      const { context, reports } = createMockContext('const msg = `hello`; // template')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('handles source with only inline comments', () => {
      const { context, reports } = createMockContext('a // one\nb // two\nc // three')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(3)
    })

    test('handles single character code before comment', () => {
      const { context, reports } = createMockContext('x//y')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('does not report for regex pattern containing escaped slashes', () => {
      const { context, reports } = createMockContext('const re = /\\/\\/test/;')
      const visitor = noInlineCommentsRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

  })
})
