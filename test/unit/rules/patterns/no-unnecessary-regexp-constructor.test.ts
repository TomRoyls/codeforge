import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryRegexpConstructorRule } from '../../../../src/rules/patterns/no-unnecessary-regexp-constructor.js'
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
    getSource: () => '[]',
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

function makeCallNode(
  firstArg: unknown,
  extraArgs: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [firstArg, ...extraArgs],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNewNode(
  firstArg: unknown,
  extraArgs: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [firstArg, ...extraArgs],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeRegexLiteral(pattern: string, flags?: string): unknown {
  const node: Record<string, unknown> = {
    type: 'RegExpLiteral',
    pattern,
    loc: makeLoc(1, 0, 1, pattern.length + 2 + (flags?.length ?? 0)),
  }
  if (flags !== undefined) {
    node.flags = flags
  }
  return node
}

// ===== META TESTS (8) =====

describe('no-unnecessary-regexp-constructor rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryRegexpConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryRegexpConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryRegexpConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryRegexpConstructorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryRegexpConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning RegExp', () => {
      const desc = noUnnecessaryRegexpConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/regexp/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryRegexpConstructorRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-regexp-constructor.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryRegexpConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (3) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryRegexpConstructorRule).toBeDefined()
      expect(noUnnecessaryRegexpConstructorRule.meta).toBeDefined()
      expect(noUnnecessaryRegexpConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — CallExpression (18) =====

  describe('positive cases — reports unnecessary RegExp call', () => {
    test('reports for RegExp(/test/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(/abc/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('abc')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(/test/i)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test', 'i')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(/test/g)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test', 'g')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(/test/gim)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test', 'gim')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(//) with empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(/\\d+/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('\\d+')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(/a|b/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('a|b')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(/^hello$/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('^hello$')))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp(/[a-z]+/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('[a-z]+')))
      expect(reports.length).toBe(1)
    })

    test('reports with second string argument RegExp(/pattern/, "g")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('pattern'), [{ type: 'Literal', value: 'g' }]))
      expect(reports.length).toBe(1)
    })

    test('reports with multiple extra arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test'), [{ type: 'Literal', value: 'g' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test')))
      expect(reports[0].message).toMatch(/RegExp/)
    })

    test('report message is exact text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test')))
      expect(reports[0].message).toBe(
        'Unnecessary RegExp constructor call with a regex literal argument. Use the regex literal directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test')))
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the regex literal not the call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      const regexNode = makeRegexLiteral('test')
      visitor.CallExpression(makeCallNode(regexNode))
      expect(reports[0].node).toBe(regexNode)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('a')))
      visitor.CallExpression(makeCallNode(makeRegexLiteral('b')))
      expect(reports.length).toBe(2)
    })
  })

  // ===== POSITIVE CASES — NewExpression (15) =====

  describe('positive cases — reports unnecessary new RegExp', () => {
    test('reports for new RegExp(/test/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('test')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/abc/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('abc')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/test/i)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('test', 'i')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/test/g)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('test', 'g')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/test/gim)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('test', 'gim')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(//) with empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/\\d+/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('\\d+')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/a|b/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('a|b')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/^hello$/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('^hello$')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/[a-z]+/)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('[a-z]+')))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/pattern/) with second arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('pattern'), [{ type: 'Literal', value: 'g' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(/pattern/) with multiple args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('test'), [{ type: 'Literal', value: 'g' }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('report message for new is same as for call', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryRegexpConstructorRule.create(ctx1)
      const visitor2 = noUnnecessaryRegexpConstructorRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeRegexLiteral('a')))
      visitor2.NewExpression(makeNewNode(makeRegexLiteral('a')))
      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('report node is the regex literal for new', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      const regexNode = makeRegexLiteral('test')
      visitor.NewExpression(makeNewNode(regexNode))
      expect(reports[0].node).toBe(regexNode)
    })

    test('accumulates reports for new across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression(makeNewNode(makeRegexLiteral('a')))
      visitor.NewExpression(makeNewNode(makeRegexLiteral('b')))
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — wrong callee (8) =====

  describe('negative cases — wrong callee', () => {
    test('does not report when callee name is not RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "regexp" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'regexp' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "REGEXP" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'REGEXP' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'RegExp' } },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "regex"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'regex' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — wrong first arg type (10) =====

  describe('negative cases — wrong first argument type', () => {
    test('does not report when first arg is string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'test' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is number Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'pattern' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 're' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(null))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — missing/wrong structure (10) =====

  describe('negative cases — missing or wrong node structure', () => {
    test('does not report for null node (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NewExpression specific (5) =====

  describe('negative cases — NewExpression does NOT report', () => {
    test('does not report for NewExpression with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression with identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression with wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyRegExp' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression when arguments is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'RegExp' } },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (18) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryRegexpConstructorRule.create(ctx1)
      const visitor2 = noUnnecessaryRegexpConstructorRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeRegexLiteral('test')))
      visitor2.CallExpression(makeCallNode({ type: 'Literal', value: 'test' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('mixed CallExpression and NewExpression reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('a')))
      visitor.NewExpression(makeNewNode(makeRegexLiteral('b')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [makeRegexLiteral('test')],
      })
      expect(reports.length).toBe(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      const node = makeCallNode(makeRegexLiteral('test'))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('a')))
      visitor.NewExpression(makeNewNode(makeRegexLiteral('b')))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test')))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [makeRegexLiteral('test')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'RegExpLiteral', pattern: 'test', loc: { start: { line: 3, column: 5 } } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      const regexNode = makeRegexLiteral('test')
      // Override the regex literal's loc to specific values
      const regexWithLoc = { ...regexNode, loc: makeLoc(10, 4, 10, 10) }
      visitor.CallExpression(makeCallNode(regexWithLoc))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryRegexpConstructorRule.create(context)
      const visitor2 = noUnnecessaryRegexpConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryRegexpConstructorRule.meta
      const meta2 = noUnnecessaryRegexpConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryRegexpConstructorRule).toBeDefined()
      expect(typeof noUnnecessaryRegexpConstructorRule.create).toBe('function')
      expect(typeof noUnnecessaryRegexpConstructorRule.meta).toBe('object')
    })

    test('mixed valid/invalid CallExpression count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      // Invalid: first arg is string
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'test' }))
      // Valid: first arg is regex literal
      visitor.CallExpression(makeCallNode(makeRegexLiteral('test')))
      // Invalid: wrong callee
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      // Valid: another regex literal
      visitor.CallExpression(makeCallNode(makeRegexLiteral('abc')))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid NewExpression count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      // Invalid: first arg is identifier
      visitor.NewExpression(makeNewNode({ type: 'Identifier', name: 'pattern' }))
      // Valid: regex literal
      visitor.NewExpression(makeNewNode(makeRegexLiteral('test')))
      // Invalid: empty arguments
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      // Valid: another regex literal
      visitor.NewExpression(makeNewNode(makeRegexLiteral('abc')))
      expect(reports.length).toBe(2)
    })

    test('NewExpression with non-RegExp callee does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'SomeOtherConstructor' },
        arguments: [makeRegexLiteral('test')],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('mixed CallExpression and NewExpression with only some matching', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexpConstructorRule.create(context)
      visitor.CallExpression(makeCallNode(makeRegexLiteral('a')))  // report
      visitor.NewExpression(makeNewNode({ type: 'Literal', value: 'pattern' }))  // no report
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'test' }))  // no report
      visitor.NewExpression(makeNewNode(makeRegexLiteral('b')))  // report
      expect(reports.length).toBe(2)
    })

  })
})
