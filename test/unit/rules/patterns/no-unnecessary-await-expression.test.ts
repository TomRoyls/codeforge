import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAwaitExpressionRule } from '../../../../src/rules/patterns/no-unnecessary-await-expression.js'
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

function makeAwaitNode(
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'AwaitExpression',
    argument,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-await-expression rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAwaitExpressionRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAwaitExpressionRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAwaitExpressionRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAwaitExpressionRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAwaitExpressionRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning await', () => {
      const desc = noUnnecessaryAwaitExpressionRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/await/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAwaitExpressionRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-await-expression.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAwaitExpressionRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with AwaitExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      expect(visitor).toHaveProperty('AwaitExpression')
      expect(typeof visitor.AwaitExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAwaitExpressionRule).toBeDefined()
      expect(noUnnecessaryAwaitExpressionRule.meta).toBeDefined()
      expect(noUnnecessaryAwaitExpressionRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — LITERALS (15) =====

  describe('positive cases — reports unnecessary await on literals', () => {
    test('reports await with NumericLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports await with StringLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'StringLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports await with BooleanLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'BooleanLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports await with BigIntLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'BigIntLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports await with NullLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NullLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports await with Literal number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports await with Literal string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports await with Literal boolean true value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports await with Literal null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: null }))
      expect(reports.length).toBe(1)
    })

    test('reports await with Literal undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: undefined }))
      expect(reports.length).toBe(1)
    })

    test('reports await with simple TemplateLiteral (no expressions, one quasi)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
        expressions: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports await with NumericLiteral zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports await with Literal negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports await with Literal empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports await with Literal false boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — ARRAY (5) =====

  describe('positive cases — reports unnecessary await on arrays', () => {
    test('reports await with empty ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports await with non-empty ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports await with nested ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'ArrayExpression',
        elements: [{ type: 'ArrayExpression', elements: [] }],
      }))
      expect(reports.length).toBe(1)
    })

    test('array report message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports[0].message).toBe(
        'Unnecessary await of an array literal. Arrays are not Promises. Remove the await keyword.',
      )
    })

    test('array report has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== POSITIVE CASES — OBJECT (5) =====

  describe('positive cases — reports unnecessary await on objects', () => {
    test('reports await with empty ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports await with ObjectExpression with properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'ObjectExpression',
        properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } }],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports await with ObjectExpression with nested objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'ObjectExpression',
        properties: [{
          type: 'Property',
          key: { type: 'Identifier', name: 'nested' },
          value: { type: 'ObjectExpression', properties: [] },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('object report message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports[0].message).toBe(
        'Unnecessary await of an object literal. Objects are not Promises. Remove the await keyword.',
      )
    })

    test('object report has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== POSITIVE CASES — MESSAGE AND PROPERTIES (10) =====

  describe('positive cases — report message and properties', () => {
    test('literal report message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      expect(reports[0].message).toBe(
        'Unnecessary await of a non-Promise literal value. Remove the await keyword.',
      )
    })

    test('literal report message mentions "await"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'StringLiteral' }))
      expect(reports[0].message).toMatch(/await/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      const node = makeAwaitNode({ type: 'NumericLiteral' })
      visitor.AwaitExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'StringLiteral' }))
      expect(reports.length).toBe(2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('all literal reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'StringLiteral' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      const node = makeAwaitNode({ type: 'NumericLiteral' })
      visitor.AwaitExpression(node)
      visitor.AwaitExpression(node)
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for await identifier (might be Promise)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'somePromise' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await function call (might return Promise)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fetch' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await Promise.resolve() (explicitly Promise)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await member expression (might be Promise)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'promise' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral with expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' } },
          { type: 'TemplateElement', value: { raw: '', cooked: '' } },
        ],
        expressions: [{ type: 'Identifier', name: 'name' }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      expect(() => visitor.AwaitExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      expect(() => visitor.AwaitExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      expect(() => visitor.AwaitExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      expect(() => visitor.AwaitExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      expect(() => visitor.AwaitExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      expect(() => visitor.AwaitExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-AwaitExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({ type: 'AwaitExpression', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({ type: 'AwaitExpression', argument: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for await LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'UpdateExpression',
        operator: '++',
        prefix: false,
        argument: { type: 'Identifier', name: 'x' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: /test/ }))
      expect(reports.length).toBe(0)
    })

    test('does not report for await FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (25) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryAwaitExpressionRule.create(ctx1)
      const visitor2 = noUnnecessaryAwaitExpressionRule.create(ctx2)
      visitor1.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      visitor2.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'somePromise' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates mixed reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'somePromise' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'StringLiteral' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'NumericLiteral' },
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'NumericLiteral' },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'somePromise' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'StringLiteral' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'anotherPromise' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAwaitExpressionRule.create(context)
      const visitor2 = noUnnecessaryAwaitExpressionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryAwaitExpressionRule.meta
      const meta2 = noUnnecessaryAwaitExpressionRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'NumericLiteral' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'NumericLiteral' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'NumericLiteral' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryAwaitExpressionRule).toBeDefined()
      expect(typeof noUnnecessaryAwaitExpressionRule.create).toBe('function')
      expect(typeof noUnnecessaryAwaitExpressionRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'NumericLiteral' },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports both array and object in sequence with different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'ArrayExpression', elements: [] }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).not.toBe(reports[1].message)
      expect(reports[0].message).toMatch(/array/)
      expect(reports[1].message).toMatch(/object/)
    })

    test('reports literal then does not report identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'maybePromise' }))
      expect(reports.length).toBe(1)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'StringLiteral' },
        loc: makeLoc(2, 5, 2, 15),
        range: [10, 20],
      })
      expect(reports.length).toBe(1)
    })

    test('large number of accumulated reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      }
      expect(reports.length).toBe(10)
    })

    test('consecutive valid cases produce zero reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'a' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'b' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'c' }))
      expect(reports.length).toBe(0)
    })

    test('consecutive invalid then valid then invalid cases', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'NumericLiteral' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'Identifier', name: 'x' }))
      visitor.AwaitExpression(makeAwaitNode({ type: 'StringLiteral' }))
      expect(reports.length).toBe(2)
    })

    test('handles node with trailingComments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'BooleanLiteral' },
        loc: makeLoc(1, 0, 1, 10),
        trailingComments: [{ type: 'Line', value: ' comment' }],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with leadingComments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression({
        type: 'AwaitExpression',
        argument: { type: 'NullLiteral' },
        loc: makeLoc(1, 0, 1, 10),
        leadingComments: [{ type: 'Block', value: ' comment' }],
      })
      expect(reports.length).toBe(1)
    })

    test('create visitor AwaitExpression is a function', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      expect(typeof visitor.AwaitExpression).toBe('function')
    })

    test('handles await expression at specific line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({ type: 'Literal', value: 42 }, 42, 8, 42, 18))
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(42)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('TemplateLiteral with multiple quasis but no expressions reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
        expressions: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('TemplateLiteral with two quasis and one expression does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitExpressionRule.create(context)
      visitor.AwaitExpression(makeAwaitNode({
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'a', cooked: 'a' } },
          { type: 'TemplateElement', value: { raw: 'b', cooked: 'b' } },
        ],
        expressions: [{ type: 'Identifier', name: 'x' }],
      }))
      expect(reports.length).toBe(0)
    })
  })
})
