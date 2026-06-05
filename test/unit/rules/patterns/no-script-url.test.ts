import { describe, expect, test, vi } from 'vitest'
import { noScriptUrlRule } from '../../../../src/rules/patterns/no-script-url.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => '',
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

function makeStringLiteralNode(
  value: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'Literal',
    value,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-script-url rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noScriptUrlRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noScriptUrlRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noScriptUrlRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noScriptUrlRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noScriptUrlRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning javascript URL', () => {
      const desc = noScriptUrlRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/javascript/)
    })

    test('should have correct docs URL', () => {
      expect(noScriptUrlRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-script-url',
      )
    })

    test('should have empty schema', () => {
      expect(noScriptUrlRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noScriptUrlRule).toBeDefined()
      expect(noScriptUrlRule.meta).toBeDefined()
      expect(noScriptUrlRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS JAVASCRIPT: URL (35) =====

  describe('positive cases — reports javascript: URL', () => {
    test('reports for "javascript:void(0)"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:alert(1)"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:alert(1)'))
      expect(reports.length).toBe(1)
    })

    test('reports for "JAVASCRIPT:alert(1)" uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('JAVASCRIPT:alert(1)'))
      expect(reports.length).toBe(1)
    })

    test('reports for "Javascript:void(0)" mixed case', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('Javascript:void(0)'))
      expect(reports.length).toBe(1)
    })

    test('reports for "JavaScript:fetch(\'/api\')" camel case', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('JavaScript:fetch(\'/api\')'))
      expect(reports.length).toBe(1)
    })

    test('reports for "JAVASCRIPT:" bare prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('JAVASCRIPT:'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:" bare prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript: window.close()" with space', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript: window.close()'))
      expect(reports.length).toBe(1)
    })

    test('reports for "JaVaScRiPt:foo" random case', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('JaVaScRiPt:foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:void(0);//comment"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0);//comment'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:document.location=\'http://evil.com\'"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:document.location=\'http://evil.com\''))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:false"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:false'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:null"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:null'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:undefined'))
      expect(reports.length).toBe(1)
    })

    test('report message is "Unexpected javascript: URL."', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      expect(reports[0].message).toBe('Unexpected javascript: URL.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input StringLiteral node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      const node = makeStringLiteralNode('javascript:void(0)')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      visitor.Literal(makeStringLiteralNode('javascript:alert(1)'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      visitor.Literal(makeStringLiteralNode('JAVASCRIPT:alert(1)'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for "javascript:0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:0'))
      expect(reports.length).toBe(1)
    })

    test('reports for "JAVASCRIPT:VOID(0)" fully uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('JAVASCRIPT:VOID(0)'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:%20alert(1)"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:%20alert(1)'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:void(document.body.innerHTML=\'\')"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(document.body.innerHTML=\'\')'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:history.back()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:history.back()'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:window.open(\'http://example.com\')"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:window.open(\'http://example.com\')'))
      expect(reports.length).toBe(1)
    })

    test('reports for "jaVascript:void(0)" another mixed case', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('jaVascript:void(0)'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:console.log(\'xss\')"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:console.log(\'xss\')'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:eval(\'code\')"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:eval(\'code\')'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:void 0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void 0'))
      expect(reports.length).toBe(1)
    })

    test('reports for "JAVASCRIPT: " bare with space', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('JAVASCRIPT: '))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:1+1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:1+1'))
      expect(reports.length).toBe(1)
    })

    test('reports for "javascript:x" minimal code', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:x'))
      expect(reports.length).toBe(1)
    })

    test('reports for "JAVAscript:void(0)" partial uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('JAVAscript:void(0)'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for "http://example.com"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('http://example.com'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "https://example.com"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('https://example.com'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "ftp://files.example.com"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('ftp://files.example.com'))
      expect(reports.length).toBe(0)
    })

    test('does not report for plain text "hello world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello world'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for "mailto:user@example.com"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('mailto:user@example.com'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "tel:+1234567890"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('tel:+1234567890'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "data:text/html,<h1>Hello</h1>"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('data:text/html,<h1>Hello</h1>'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      expect(() => visitor.Literal(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when value is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: true, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: ['javascript:void(0)'], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for "notjavascript:void(0)" no colon prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('notjavascript:void(0)'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "javascript void(0)" missing colon', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript void(0)'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "/path/to/javascript:file" middle occurrence', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('/path/to/javascript:file'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "some text about javascript: something"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('some text about javascript: something'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for "file:///path/to/file"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('file:///path/to/file'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "ws://localhost:8080"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('ws://localhost:8080'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "wss://secure.example.com"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('wss://secure.example.com'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "/relative/path"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('/relative/path'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "#anchor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('#anchor'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noScriptUrlRule.create(ctx1)
      const visitor2 = noScriptUrlRule.create(ctx2)
      visitor1.Literal(makeStringLiteralNode('javascript:void(0)'))
      visitor2.Literal(makeStringLiteralNode('http://example.com'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      visitor.Literal(makeStringLiteralNode('http://example.com'))
      visitor.Literal(makeStringLiteralNode('javascript:alert(1)'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      const node = { type: 'StringLiteral', value: 'javascript:void(0)' }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      const node = { type: 'StringLiteral', value: 'javascript:void(0)' }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('http://example.com'))
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      visitor.Literal(makeStringLiteralNode('https://example.com'))
      visitor.Literal(makeStringLiteralNode('JAVASCRIPT:alert(1)'))
      visitor.Literal(makeStringLiteralNode('ftp://files.example.com'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noScriptUrlRule.create(context)
      const visitor2 = noScriptUrlRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noScriptUrlRule.meta
      const meta2 = noScriptUrlRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      const node = {
        type: 'StringLiteral',
        value: 'javascript:void(0)',
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        raw: '"javascript:void(0)"',
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 'javascript:void(0)', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 'javascript:void(0)', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      const node = makeStringLiteralNode('javascript:void(0)')
      visitor.Literal(node)
      visitor.Literal(node)
      visitor.Literal(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)', 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 'javascript:void(0)', loc: makeLoc(1, 0, 1, 20), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(noScriptUrlRule).toBeDefined()
      expect(typeof noScriptUrlRule.create).toBe('function')
      expect(typeof noScriptUrlRule.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noScriptUrlRule.create(context)
      visitor.Literal(makeStringLiteralNode('javascript:void(0)'))
      visitor.Literal(makeStringLiteralNode('JAVASCRIPT:alert(1)'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
