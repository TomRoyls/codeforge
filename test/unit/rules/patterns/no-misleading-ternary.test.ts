import { describe, expect, test, vi } from 'vitest'
import { noMisleadingTernaryRule } from '../../../../src/rules/patterns/no-misleading-ternary.js'
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

function makeExpressionStatement(expression: unknown, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 30): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeConditional(
  testNode: unknown = { type: 'Identifier', name: 'cond' },
  consequent: unknown = { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] },
  alternate: unknown = { type: 'CallExpression', callee: { type: 'Identifier', name: 'bar' }, arguments: [] },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'ConditionalExpression',
    test: testNode,
    consequent,
    alternate,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-misleading-ternary rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMisleadingTernaryRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMisleadingTernaryRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMisleadingTernaryRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMisleadingTernaryRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMisleadingTernaryRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning ternary', () => {
      const desc = noMisleadingTernaryRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/ternary/)
    })

    test('should have correct docs URL', () => {
      expect(noMisleadingTernaryRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-misleading-ternary.md',
      )
    })

    test('should have empty schema', () => {
      expect(noMisleadingTernaryRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMisleadingTernaryRule).toBeDefined()
      expect(noMisleadingTernaryRule.meta).toBeDefined()
      expect(noMisleadingTernaryRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports ternary as statement', () => {
    test('reports for simple ternary as statement: cond ? foo() : bar()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports.length).toBe(1)
    })

    test('report message mentions ternary operator as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports[0].message).toMatch(/ternary/)
    })

    test('report message mentions if/else', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports[0].message).toMatch(/if\/else/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports[0].message).toBe(
        'Do not use a ternary operator as a statement. Use an if/else statement instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the ConditionalExpression, not the ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      const cond = makeConditional()
      visitor.ExpressionStatement(makeExpressionStatement(cond))
      expect(reports[0].node).toBe(cond)
    })

    test('reports for ternary with identifier test', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional({ type: 'Identifier', name: 'flag' })))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with binary expression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional({
        type: 'BinaryExpression',
        operator: '>',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with call expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'ok' },
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'success' }, arguments: [] },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with literal consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with identifier consequent and alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with member expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with logical expression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with unary expression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'flag' },
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with assignment expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with function call alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'Literal', value: 1 },
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'handleError' }, arguments: [] },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with new expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'MyClass' }, arguments: [] },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with conditional expression test (nested)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        makeConditional({ type: 'Identifier', name: 'a' }, { type: 'Literal', value: true }, { type: 'Literal', value: false }),
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with array expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with object expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'ObjectExpression', properties: [] },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with template literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'check' },
        arguments: [],
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with void expression alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'Literal', value: 1 },
        { type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Literal', value: 0 } },
      )))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with typeof expression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } },
        right: { type: 'Literal', value: 'string' },
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for ternary with update expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'counter' } },
      )))
      expect(reports.length).toBe(1)
    })

    test('report loc values are preserved from the ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      const cond = makeConditional(undefined, undefined, undefined, 5, 10, 5, 40)
      visitor.ExpressionStatement(makeExpressionStatement(cond))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for ternary with tagged template consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
      )))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for VariableDeclaration containing ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with non-ternary expression (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with Identifier expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: makeConditional(),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with Literal expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'UpdateExpression',
        operator: '++',
        prefix: false,
        argument: { type: 'Identifier', name: 'i' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'flag' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'promise' }, arguments: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with ThrowExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
        delegate: false,
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement({ type: 'IfStatement', test: {}, consequent: {} })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      expect(() => visitor.ExpressionStatement({ type: 'ReturnStatement', argument: null })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: 'not-an-expr', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression type is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression type is TaggedTemplateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression type is SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'args' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression type is ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'ThisExpression' }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMisleadingTernaryRule.create(ctx1)
      const visitor2 = noMisleadingTernaryRule.create(ctx2)
      visitor1.ExpressionStatement(makeExpressionStatement(makeConditional()))
      visitor2.ExpressionStatement(makeExpressionStatement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makeConditional(),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makeConditional(),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makeConditional(),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      const cond = makeConditional(undefined, undefined, undefined, 3, 5, 3, 25)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: cond,
        loc: { start: { line: 3, column: 4 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      const node = makeExpressionStatement(makeConditional())
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noMisleadingTernaryRule).toBeDefined()
      expect(typeof noMisleadingTernaryRule.create).toBe('function')
      expect(typeof noMisleadingTernaryRule.meta).toBe('object')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMisleadingTernaryRule.create(context)
      const visitor2 = noMisleadingTernaryRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noMisleadingTernaryRule.meta
      const meta2 = noMisleadingTernaryRule.meta
      expect(meta1).toBe(meta2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional())) // reports
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] })) // no report
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'Identifier', name: 'x' })) // no report
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional())) // reports
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'Literal', value: 42 })) // no report
      expect(reports.length).toBe(2)
    })

    test('handles deeply nested ternary as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      const innerCond = makeConditional({ type: 'Identifier', name: 'b' }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 })
      const outerCond = makeConditional({ type: 'Identifier', name: 'a' }, innerCond, { type: 'Literal', value: 4 })
      visitor.ExpressionStatement(makeExpressionStatement(outerCond))
      expect(reports.length).toBe(1)
    })

    test('report loc comes from the ConditionalExpression not the ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      const cond = makeConditional(undefined, undefined, undefined, 7, 2, 7, 35)
      visitor.ExpressionStatement(makeExpressionStatement(cond, 7, 0, 7, 36))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makeConditional(),
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles ExpressionStatement with directive property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makeConditional(),
        loc: makeLoc(1, 0, 1, 10),
        directive: undefined,
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for ExpressionStatement with string literal directive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({ type: 'Literal', value: 'use strict' }))
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional()))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles conditional expression with null consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Literal', value: null },
        alternate: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(1)
    })

    test('handles conditional expression with regex test', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional({
        type: 'BinaryExpression',
        operator: '~',
        left: { type: 'Literal', value: /pattern/ },
        right: { type: 'Identifier', name: 'str' },
      })))
      expect(reports.length).toBe(1)
    })

    test('handles conditional expression with spread element alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingTernaryRule.create(context)
      visitor.ExpressionStatement(makeExpressionStatement(makeConditional(
        { type: 'Identifier', name: 'flag' },
        { type: 'Literal', value: 1 },
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
      )))
      expect(reports.length).toBe(1)
    })
  })
})
