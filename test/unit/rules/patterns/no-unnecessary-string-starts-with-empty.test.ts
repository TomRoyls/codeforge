import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringStartsWithEmptyRule } from '../../../../src/rules/patterns/index.js'
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

function makeStartsWithCall(
  object: unknown,
  arg: unknown = { type: 'StringLiteral', value: '' },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: 'startsWith' },
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-starts-with-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning startsWith', () => {
      const desc = noUnnecessaryStringStartsWithEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/startswith/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-starts-with-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule).toBeDefined()
      expect(noUnnecessaryStringStartsWithEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringStartsWithEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports str.startsWith("")', () => {
    test('reports for identifier.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }))
      expect(reports.length).toBe(1)
    })

    test('reports for literal string.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression obj.prop.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression getResult().startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getResult' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression concatenation.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions startsWith', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }))
      expect(reports[0].message).toMatch(/startsWith/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }))
      expect(reports[0].message).toBe(
        `str.startsWith('') always returns true. This is likely unintentional.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      const node = makeStartsWithCall({ type: 'Identifier', name: 'str' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, undefined, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for conditional expression result.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for array expression result.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for this.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'ThisExpression' }))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 's' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for tagged template expression.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for type cast expression.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'TSAsExpression', expression: { type: 'Identifier', name: 'val' }, typeAnnotation: { type: 'TSStringKeyword' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for await expression result.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetchStr' }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for chained calls a.b.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'a' },
        property: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for string variable with empty string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'myStr' }, { type: 'StringLiteral', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports even when StringLiteral has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'StringLiteral', value: '', raw: "''" }))
      expect(reports.length).toBe(1)
    })

    test('reports for object expression startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for update expression result.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for sequence expression result.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 'str' }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression result.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 'hello' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for logical expression result.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Literal', value: 'fallback' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for function expression result.startsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'CallExpression', callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.startsWith("a") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'StringLiteral', value: 'a' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("hello") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'StringLiteral', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(" ") — whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'StringLiteral', value: ' ' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("", 0) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }, { type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("", pos) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }, { type: 'Identifier', name: 'pos' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(variable) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'Identifier', name: 'prefix' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(0) — NumericLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed property str["startsWith"]("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'startsWith' },
          computed: true,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'startsWith' },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'Literal', value: '' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(templateLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "STARTSWITH" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'STARTSWITH' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "startswith" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startswith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments str.startsWith("", 0, false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }, { type: 'Literal', value: 0 }, { type: 'Literal', value: false }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(undefined) — Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for argument type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'CallExpression', callee: { type: 'Identifier', name: 'getPrefix' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for argument type is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prefix' } }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringStartsWithEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringStartsWithEmptyRule.create(ctx2)
      visitor1.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'a' }))
      visitor2.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'b' }, { type: 'StringLiteral', value: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'b' }, { type: 'StringLiteral', value: 'x' }))
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'c' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'a' }, { type: 'StringLiteral', value: 'x' }))
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'b' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'startsWith' },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'd' }))
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'e' }, { type: 'StringLiteral', value: 'ab' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringStartsWithEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringStartsWithEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringStartsWithEmptyRule.meta
      const meta2 = noUnnecessaryStringStartsWithEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      const node = makeStartsWithCall({ type: 'Identifier', name: 'str' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringStartsWithEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringStartsWithEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringStartsWithEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'str' }, undefined, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed: false explicitly — still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
          computed: false,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'startsWith' },
          computed: true,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringStartsWithEmptyRule.create(context)
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeStartsWithCall({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
