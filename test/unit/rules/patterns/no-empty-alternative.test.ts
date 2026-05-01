import { describe, expect, test, vi } from 'vitest'
import { noEmptyAlternativeRule } from '../../../../src/rules/patterns/no-empty-alternative.js'
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
    getSource: () => '/regex/',
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

function makeRegExpNode(
  pattern: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'RegExpLiteral',
    pattern,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-empty-alternative rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noEmptyAlternativeRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noEmptyAlternativeRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noEmptyAlternativeRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noEmptyAlternativeRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noEmptyAlternativeRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning regex alternation', () => {
      const desc = noEmptyAlternativeRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/alternati/)
    })

    test('should have correct docs URL', () => {
      expect(noEmptyAlternativeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-empty-alternative',
      )
    })

    test('should have empty schema', () => {
      expect(noEmptyAlternativeRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with RegExpLiteral', () => {
      const { context } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      expect(visitor).toHaveProperty('RegExpLiteral')
      expect(typeof visitor.RegExpLiteral).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noEmptyAlternativeRule).toBeDefined()
      expect(noEmptyAlternativeRule.meta).toBeDefined()
      expect(noEmptyAlternativeRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EMPTY ALTERNATIVE (30) =====

  describe('positive cases — reports empty alternative', () => {
    test('reports for leading empty alternative "|a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('|a'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing empty alternative "a|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      expect(reports.length).toBe(1)
    })

    test('reports for middle empty alternative "a||b"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a||b'))
      expect(reports.length).toBe(1)
    })

    test('reports for pattern that is only pipe "|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('|'))
      expect(reports.length).toBe(1)
    })

    test('reports for double pipe "||"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('||'))
      expect(reports.length).toBe(1)
    })

    test('reports for triple pipe "|||"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('|||'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing empty with two parts "a|b|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|b|'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading empty with two parts "|a|b"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('|a|b'))
      expect(reports.length).toBe(1)
    })

    test('reports for word trailing empty "foo|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('foo|'))
      expect(reports.length).toBe(1)
    })

    test('reports for word leading empty "|foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('|foo'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Empty alternative"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      expect(reports[0].message).toContain('Empty alternative')
    })

    test('report message mentions "empty string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      expect(reports[0].message.toLowerCase()).toContain('empty string')
    })

    test('report message mentions "mistake"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      expect(reports[0].message.toLowerCase()).toContain('mistake')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input RegExpLiteral node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      const node = makeRegExpNode('a|')
      visitor.RegExpLiteral(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for longer trailing empty "abc|def|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('abc|def|'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading empty with three parts "|x|y|z"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('|x|y|z'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing empty with three parts "x|y|z|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('x|y|z|'))
      expect(reports.length).toBe(1)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|', 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      expect(reports[0].message).toBe(
        'Empty alternative in regex alternation. This matches the empty string and is likely a mistake.',
      )
    })

    test('reports only once per regex even with multiple empty alternatives', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('|||'))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      visitor.RegExpLiteral(makeRegExpNode('|b'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      visitor.RegExpLiteral(makeRegExpNode('||b'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for simple trailing empty "test|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('test|'))
      expect(reports.length).toBe(1)
    })

    test('reports for multi-word trailing empty "hello|world|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('hello|world|'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-char trailing empty "x|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('x|'))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric pattern trailing empty "123|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('123|'))
      expect(reports.length).toBe(1)
    })

    test('reports for dotted pattern with trailing empty "a.b|c|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a.b|c|'))
      expect(reports.length).toBe(1)
    })

    test('reports for regex metachar pattern ".*|"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('.*|'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for pattern without pipe "abc"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid alternation "a|b"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid alternation "foo|bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('foo|bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      expect(() => visitor.RegExpLiteral(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      expect(() => visitor.RegExpLiteral(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      expect(() => visitor.RegExpLiteral({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      expect(() => visitor.RegExpLiteral('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      expect(() => visitor.RegExpLiteral(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      expect(() => visitor.RegExpLiteral(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      expect(() => visitor.RegExpLiteral([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when pattern property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when pattern is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when pattern is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: 123, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when pattern is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: '', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for valid three-part alternation "x|y|z"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('x|y|z'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid three-part alternation "abc|def|ghi"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('abc|def|ghi'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid five-part alternation "a|b|c|d|e"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|b|c|d|e'))
      expect(reports.length).toBe(0)
    })

    test('does not report for single char pattern "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid multi-part alternation "complex|regex|pattern"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('complex|regex|pattern'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noEmptyAlternativeRule.create(ctx1)
      const visitor2 = noEmptyAlternativeRule.create(ctx2)
      visitor1.RegExpLiteral(makeRegExpNode('a|'))
      visitor2.RegExpLiteral(makeRegExpNode('a|b'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      visitor.RegExpLiteral(makeRegExpNode('abc'))
      visitor.RegExpLiteral(makeRegExpNode('|b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      const node = { type: 'RegExpLiteral', pattern: 'a|' }
      visitor.RegExpLiteral(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      const node = { type: 'RegExpLiteral', pattern: 'a|' }
      visitor.RegExpLiteral(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|b'))
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      visitor.RegExpLiteral(makeRegExpNode('abc'))
      visitor.RegExpLiteral(makeRegExpNode('|b'))
      visitor.RegExpLiteral(makeRegExpNode('x|y|z'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noEmptyAlternativeRule.create(context)
      const visitor2 = noEmptyAlternativeRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noEmptyAlternativeRule.meta
      const meta2 = noEmptyAlternativeRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      const node = {
        type: 'RegExpLiteral',
        pattern: 'a|',
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        flags: 'g',
      }
      visitor.RegExpLiteral(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: 'a|', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: 'a|', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      const node = makeRegExpNode('a|')
      visitor.RegExpLiteral(node)
      visitor.RegExpLiteral(node)
      visitor.RegExpLiteral(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noEmptyAlternativeRule).toBeDefined()
      expect(typeof noEmptyAlternativeRule.create).toBe('function')
      expect(typeof noEmptyAlternativeRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: 'a|', loc: makeLoc(1, 0, 1, 5), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|'))
      visitor.RegExpLiteral(makeRegExpNode('||b'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with flags alongside pattern still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: 'a|', flags: 'gi', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(1)
    })

    test('does not report when only regex.pattern is set (not direct pattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', regex: { pattern: 'a|', flags: '' }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when pattern is set to boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: true, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral(makeRegExpNode('a|', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when pattern is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyAlternativeRule.create(context)
      visitor.RegExpLiteral({ type: 'RegExpLiteral', pattern: ['a', 'b'], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })
})
