import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringToLowerCaseEmptyRule } from '../../../../src/rules/patterns/index.js'
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
  computed = false,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed,
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-to-lower-case-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toLowerCase', () => {
      const desc = noUnnecessaryStringToLowerCaseEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tolowercase/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-to-lower-case-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule).toBeDefined()
      expect(noUnnecessaryStringToLowerCaseEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringToLowerCaseEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (29) =====

  describe('positive cases — reports unnecessary toLowerCase empty string', () => {
    test('reports for str.toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', computed: true, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 } }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toLowerCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toMatch(/toLowerCase/)
    })

    test('report message mentions empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toMatch(/empty string/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toBe(
        `str.toLowerCase('') passes an unnecessary empty string. toLowerCase() takes no arguments.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }], false, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's2' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's2' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for ConditionalExpression object .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression object .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression object .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained calls: foo().toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      const innerCall = { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }
      visitor.CallExpression(makeCallNode(innerCall, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Obj().toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Obj' }, arguments: [] }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'x' } }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression object .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression object .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression object .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal object .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: '' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for numerical literal object .toLowerCase("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.toLowerCase() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase("a") with non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase("hello world") with longer string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: 'hello world' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase(" ") with whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: ' ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase("", "extra") — 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase("", "", "") — 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }, { type: 'StringLiteral', value: '' }, { type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression str["toLowerCase"]("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'toLowerCase' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toLowerCase' },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'StringLiteral', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier (Literal property)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'toLowerCase' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOLOWERCASE" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'TOLOWERCASE', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tolowercase" (all lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'tolowercase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a TemplateLiteral with empty quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }], expressions: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringToLowerCaseEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringToLowerCaseEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase')) // no args — negative
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }])) // positive
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [{ type: 'StringLiteral', value: '' }])) // wrong method — negative
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }])) // positive
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: 'a' }])) // non-empty — negative
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringToLowerCaseEmptyRule.meta
      const meta2 = noUnnecessaryStringToLowerCaseEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
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
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
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
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringToLowerCaseEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringToLowerCaseEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringToLowerCaseEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }], false, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
          computed: true,
        },
        arguments: [{ type: 'StringLiteral', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's2' }, 'toLowerCase', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [undefined]))
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })
})
