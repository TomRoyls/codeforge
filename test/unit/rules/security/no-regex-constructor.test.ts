import { describe, expect, test, vi } from 'vitest'
import { noRegexConstructorRule } from '../../../../src/rules/security/no-regex-constructor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'new RegExp(pattern)',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeNewRegExp(firstArg: unknown, line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [firstArg],
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-regex-constructor rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRegexConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRegexConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "security"', () => {
      expect(noRegexConstructorRule.meta.docs?.category).toBe('security')
    })

    test('should be recommended', () => {
      expect(noRegexConstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noRegexConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning RegExp and ReDoS', () => {
      const desc = noRegexConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/regexp/)
      expect(desc).toMatch(/redos/)
    })

    test('should have correct docs URL', () => {
      expect(noRegexConstructorRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-regex-constructor',
      )
    })

    test('should have empty schema', () => {
      expect(noRegexConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRegexConstructorRule).toBeDefined()
      expect(noRegexConstructorRule.meta).toBeDefined()
      expect(noRegexConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports dynamic RegExp constructor', () => {
    test('reports new RegExp(variable) — Identifier first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'pattern' }))
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(expr) — BinaryExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 'b' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(getPattern()) — CallExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getPattern' },
        arguments: [],
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(obj.pattern) — MemberExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'pattern' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('message contains "Dynamic"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports[0].message).toContain('Dynamic')
    })

    test('message contains "ReDoS"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports[0].message).toContain('ReDoS')
    })

    test('message contains "non-literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports[0].message).toContain('non-literal')
    })

    test('report has loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({ type: 'Identifier', name: 'p' })
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('multiple violations accumulate', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'a' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'b' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'c' }))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports new RegExp with TemplateLiteral first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp with ArrowFunction first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Literal', value: '' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp with ConditionalExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 'a' },
        alternate: { type: 'Literal', value: 'b' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp with ArrayExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'ArrayExpression',
        elements: [],
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp with ObjectExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'ObjectExpression',
        properties: [],
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp with UnaryExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp with UpdateExpression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'a' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'b' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'c' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'd' }))
      expect(reports.length).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report new RegExp("literal") — Literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({ type: 'Literal', value: 'pattern' })
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp(/regex/) — regex Literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({ type: 'Literal', value: /regex/, regex: { pattern: 'regex', flags: '' } })
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report /regex/ literal — not a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = { type: 'Literal', value: /regex/, loc: makeLoc(1, 0, 1, 8) }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report RegExp("static") — not new (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new NotRegExp(variable) — non-RegExp constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'NotRegExp' },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node without relevant properties — Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when there are no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({ type: 'Literal', value: '[a-z]+' })
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'RegExp' },
        },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new SomeOtherConstructor(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'SomeOtherConstructor' },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        arguments: [{ type: 'Identifier', name: 'p' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclarator type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionDeclaration type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp with Literal numeric first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({ type: 'Literal', value: 42 })
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp with Literal boolean first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({ type: 'Literal', value: true })
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp with Literal null first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({ type: 'Literal', value: null })
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "regexp" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'regexp' },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "REGEXP" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'REGEXP' },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Error(variable) — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Identifier', name: 'msg' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Map(entries) — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [{ type: 'Identifier', name: 'entries' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Set(values) — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [{ type: 'Identifier', name: 'values' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Promise(executor) — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'Identifier', name: 'executor' }],
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Array(variable) — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'Identifier', name: 'size' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Object(variable) — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [{ type: 'Identifier', name: 'src' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'key' },
        value: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BlockStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report IfStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRegexConstructorRule.create(ctx1)
      const visitor2 = noRegexConstructorRule.create(ctx2)

      visitor1.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      visitor2.NewExpression(makeNewRegExp({ type: 'Literal', value: 'safe' }))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'a' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Identifier', name: 'p' }],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Identifier', name: 'p' }],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      // reports — dynamic
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'a' }))
      // does NOT report — literal
      visitor.NewExpression(makeNewRegExp({ type: 'Literal', value: 'safe' }))
      // reports — dynamic
      visitor.NewExpression(makeNewRegExp({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      // does NOT report — wrong constructor
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Identifier', name: 'msg' }],
        loc: makeLoc(3, 0, 3, 10),
      })
      // reports — dynamic
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'd' }))
      expect(reports.length).toBe(3)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }, 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noRegexConstructorRule.create(context)
      const visitor2 = noRegexConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports.length).toBe(3)
    })

    test('handles node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [{ type: 'Identifier', name: 'p' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [{ type: 'Identifier', name: 'p' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with null first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 15),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with undefined first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 15),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Literal with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [
          { type: 'Literal', value: 'pattern' },
          { type: 'Literal', value: 'gi' },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports when first arg is dynamic with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [
          { type: 'Identifier', name: 'pattern' },
          { type: 'Literal', value: 'gi' },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'a' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all violation messages are identical for the same rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'a' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'b' }))
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'c' }))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('rule meta is the same reference across multiple accesses', () => {
      const meta1 = noRegexConstructorRule.meta
      const meta2 = noRegexConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule export has create and meta properties', () => {
      expect(noRegexConstructorRule).toBeDefined()
      expect(typeof noRegexConstructorRule.create).toBe('function')
      expect(typeof noRegexConstructorRule.meta).toBe('object')
    })

    test('message mentions "RegExp()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports[0].message).toContain('RegExp()')
    })

    test('message mentions "regex literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewRegExp({ type: 'Identifier', name: 'p' }))
      expect(reports[0].message.toLowerCase()).toContain('regex literal')
    })

    test('does not report new RegExp with SequenceExpression first arg that is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'SequenceExpression',
        expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report new RegExp with LogicalExpression first arg — it IS dynamic', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 'fallback' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report new RegExp with TaggedTemplateExpression first arg — it IS dynamic', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', expressions: [] },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report new RegExp with AwaitExpression first arg — it IS dynamic', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report new RegExp with YieldExpression first arg — it IS dynamic', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'gen' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report new FunctionExpression first arg — it IS dynamic', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report new Date(timestamp) — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Date' },
        arguments: [{ type: 'Identifier', name: 'ts' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Map() — different constructor with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp with LogicalExpression Literal-only — still non-Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConstructorRule.create(context)
      const node = makeNewRegExp({
        type: 'LogicalExpression',
        operator: '??',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
      })
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })
  })
})
