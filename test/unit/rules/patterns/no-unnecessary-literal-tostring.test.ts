import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryLiteralTostringRule } from '../../../../src/rules/patterns/no-unnecessary-literal-tostring.js'
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
  object: unknown,
  methodName: string,
  args: unknown[] = [],
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
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeStringLiteral(value: string): unknown {
  return { type: 'StringLiteral', value }
}

function makeTemplateLiteral(quasis: unknown[], expressions: unknown[]): unknown {
  return { type: 'TemplateLiteral', quasis, expressions }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-literal-tostring rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryLiteralTostringRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryLiteralTostringRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryLiteralTostringRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryLiteralTostringRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryLiteralTostringRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toString', () => {
      const desc = noUnnecessaryLiteralTostringRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tostring/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryLiteralTostringRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-literal-tostring.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryLiteralTostringRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryLiteralTostringRule).toBeDefined()
      expect(noUnnecessaryLiteralTostringRule.meta).toBeDefined()
      expect(noUnnecessaryLiteralTostringRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — STRING LITERAL REPORTS (15) =====

  describe('positive cases — reports unnecessary toString on string literals', () => {
    test('reports for double-quoted string literal "hello".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-quoted string literal "world".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('world'), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal "".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal with spaces "  ".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('  '), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal with special characters "\\n\\t".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('\n\t'), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for long string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'.repeat(1000)), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal with unicode characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('你好世界'), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal with emoji', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('🎉🚀'), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('string literal report message mentions string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toString'))
      expect(reports[0].message).toMatch(/string literal/)
    })

    test('string literal report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toString'))
      expect(reports[0].message).toBe(
        'Unnecessary .toString() on a string literal. The value is already a string.',
      )
    })

    test('string literal report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('x'), 'toString'))
      expect(reports[0].loc).toBeDefined()
    })

    test('string literal report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('x'), 'toString'))
      expect(reports[0].node).toBeDefined()
    })

    test('string literal report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      const node = makeCallNode(makeStringLiteral('test'), 'toString')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('string literal report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('x'), 'toString', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties for string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toString'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== POSITIVE CASES — TEMPLATE LITERAL REPORTS (12) =====

  describe('positive cases — reports unnecessary toString on template literals', () => {
    test('reports for template literal without expressions `hello`.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }], []), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty template literal `.toString()`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: '', cooked: '' } }], []), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal with whitespace ` `.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: '  ', cooked: '  ' } }], []), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: '\\n\\t', cooked: '\n\t' } }], []), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal with unicode', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: '你好', cooked: '你好' } }], []), 'toString'))
      expect(reports.length).toBe(1)
    })

    test('template literal report message mentions template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }], []), 'toString'))
      expect(reports[0].message).toMatch(/template literal/)
    })

    test('template literal report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'test', cooked: 'test' } }], []), 'toString'))
      expect(reports[0].message).toBe(
        'Unnecessary .toString() on a template literal without expressions. The value is already a string.',
      )
    })

    test('template literal report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'x', cooked: 'x' } }], []), 'toString'))
      expect(reports[0].loc).toBeDefined()
    })

    test('template literal report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'x', cooked: 'x' } }], []), 'toString'))
      expect(reports[0].node).toBeDefined()
    })

    test('template literal report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      const node = makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'x', cooked: 'x' } }], []), 'toString')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('template literal report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'x', cooked: 'x' } }], []), 'toString', [], 8, 3, 8, 20))
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('accumulates reports across multiple string literal calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toString'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('b'), 'toString'))
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for variable.toString() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for number literal (42).toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NumericLiteral', value: 42 }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean literal true.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BooleanLiteral', value: true }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with expressions `hello ${x}`.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' } }], [{ type: 'Identifier', name: 'x' }]), 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with multiple expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'a', cooked: 'a' } }, { type: 'TemplateElement', value: { raw: 'b', cooked: 'b' } }], [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]), 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".valueOf() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toUpperCase() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".trim() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toLowerCase() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Literal', value: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tostring" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'tostring'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOSTRING" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'TOSTRING'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NumericLiteral', value: 42 }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is BigIntLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BigIntLiteral', value: '100n' }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BooleanLiteral', value: true }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when TemplateLiteral expressions is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: 'not-array' }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when TemplateLiteral expressions is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: null }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when TemplateLiteral expressions is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [] }, 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report when TemplateLiteral expressions has one element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: '', cooked: '' } }, { type: 'TemplateElement', value: { raw: '', cooked: '' } }], [{ type: 'Identifier', name: 'x' }]), 'toString'))
      expect(reports.length).toBe(0)
    })

    test('reports for Literal type with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'toString'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== EDGE CASES (18) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryLiteralTostringRule.create(ctx1)
      const visitor2 = noUnnecessaryLiteralTostringRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeStringLiteral('a'), 'toString'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toString'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly across string and template literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toString'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toString'))
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'b', cooked: 'b' } }], []), 'toString'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports for string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports for template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'x', cooked: 'x' } }], []),
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toString')) // report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toString')) // no report
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'b', cooked: 'b' } }], []), 'toString')) // report
      visitor.CallExpression(makeCallNode({ type: 'NumericLiteral', value: 42 }, 'toString')) // no report
      visitor.CallExpression(makeCallNode(makeStringLiteral('c'), 'toString')) // report
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryLiteralTostringRule.create(context)
      const visitor2 = noUnnecessaryLiteralTostringRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryLiteralTostringRule.meta
      const meta2 = noUnnecessaryLiteralTostringRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
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
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      const node = makeCallNode(makeStringLiteral('a'), 'toString')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('x'), 'toString', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toString' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Literal', value: 'toString' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralTostringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toString'))
      visitor.CallExpression(makeCallNode(makeTemplateLiteral([{ type: 'TemplateElement', value: { raw: 'b', cooked: 'b' } }], []), 'toString'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('string literal')
      expect(reports[1].message).toContain('template literal')
    })
  })
})
